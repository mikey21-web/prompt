/**
 * PromptForge Discord Bot.
 *
 * Slash commands:
 *   /forge <input> [target]     — translate plain English to model-native prompt
 *   /showdown <input>           — side-by-side for 4 flagship models
 *   /reverse <prompt>           — reverse-engineer a prompt to plain English
 *
 * Setup:
 *   1. Create a Discord application at https://discord.com/developers/applications
 *   2. Add a bot, copy the token
 *   3. Set env vars: DISCORD_TOKEN, DISCORD_CLIENT_ID, PROMPTFORGE_API_KEY
 *   4. Run: npm run register   (registers slash commands once)
 *   5. Run: npm start
 *
 * Invite URL:
 *   https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=2048&scope=bot+applications.commands
 */

import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Colors,
} from "discord.js";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN ?? "";
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? "";
const PROMPTFORGE_API_KEY = process.env.PROMPTFORGE_API_KEY ?? "";
const PROMPTFORGE_API_URL =
  process.env.PROMPTFORGE_API_URL ?? "https://promptforge.dev";

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !PROMPTFORGE_API_KEY) {
  console.error(
    "Missing env vars: DISCORD_TOKEN, DISCORD_CLIENT_ID, PROMPTFORGE_API_KEY"
  );
  process.exit(1);
}

// ─── API helpers ─────────────────────────────────────────────────────────────

async function callApi(
  path: string,
  body: Record<string, unknown>
): Promise<unknown> {
  const res = await fetch(`${PROMPTFORGE_API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PROMPTFORGE_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── command handlers ─────────────────────────────────────────────────────────

async function handleForge(i: ChatInputCommandInteraction): Promise<void> {
  await i.deferReply();
  const input = i.options.getString("input", true);
  const target = i.options.getString("target") ?? undefined;
  try {
    const data = (await callApi("/api/forge", { input, target })) as {
      optimized: string;
      target: string;
    };
    const embed = new EmbedBuilder()
      .setColor(Colors.Purple)
      .setTitle(`⚒ Forged for ${data.target}`)
      .setDescription(`**Input:** ${input.slice(0, 200)}\n\n**Optimized:**\n\`\`\`\n${data.optimized.slice(0, 1800)}\n\`\`\``)
      .setFooter({ text: "PromptForge • promptforge.dev" });
    await i.editReply({ embeds: [embed] });
  } catch (e) {
    await i.editReply(`❌ ${e instanceof Error ? e.message : "Forge failed"}`);
  }
}

async function handleShowdown(i: ChatInputCommandInteraction): Promise<void> {
  await i.deferReply();
  const input = i.options.getString("input", true);
  try {
    const data = (await callApi("/api/showdown", {
      input,
      targets: ["claude-sonnet-4.5", "gpt-4o", "gemini-2.5-pro", "midjourney-v7"],
    })) as {
      outputs: { target: string; optimized: string; error: string | null }[];
    };

    const embed = new EmbedBuilder()
      .setColor(Colors.Purple)
      .setTitle("⚔ Showdown")
      .setDescription(`**Input:** ${input.slice(0, 200)}`)
      .setFooter({ text: "PromptForge • promptforge.dev" });

    for (const out of data.outputs) {
      const value = out.error
        ? `*Error: ${out.error}*`
        : `\`\`\`\n${out.optimized.slice(0, 900)}\n\`\`\``;
      embed.addFields({ name: out.target, value, inline: false });
    }
    await i.editReply({ embeds: [embed] });
  } catch (e) {
    await i.editReply(`❌ ${e instanceof Error ? e.message : "Showdown failed"}`);
  }
}

async function handleReverse(i: ChatInputCommandInteraction): Promise<void> {
  await i.deferReply();
  const prompt = i.options.getString("prompt", true);
  try {
    const data = (await callApi("/api/reverse", { prompt })) as {
      explanation: string;
    };
    const embed = new EmbedBuilder()
      .setColor(Colors.Blue)
      .setTitle("🔬 Reverse")
      .setDescription(data.explanation.slice(0, 2000))
      .setFooter({ text: "PromptForge • promptforge.dev" });
    await i.editReply({ embeds: [embed] });
  } catch (e) {
    await i.editReply(`❌ ${e instanceof Error ? e.message : "Reverse failed"}`);
  }
}

// ─── slash command definitions ────────────────────────────────────────────────

const TARGET_CHOICES = [
  { name: "Auto-detect", value: "auto" },
  { name: "Claude Sonnet 4.5", value: "claude-sonnet-4.5" },
  { name: "GPT-4o", value: "gpt-4o" },
  { name: "Gemini 2.5 Pro", value: "gemini-2.5-pro" },
  { name: "Midjourney v7", value: "midjourney-v7" },
  { name: "Sora 2", value: "sora-2" },
  { name: "Suno v4", value: "suno-v4" },
];

const commands = [
  new SlashCommandBuilder()
    .setName("forge")
    .setDescription("Translate plain English into the optimal prompt for any AI model")
    .addStringOption((o) =>
      o.setName("input").setDescription("Plain English description").setRequired(true)
    )
    .addStringOption((o) =>
      o
        .setName("target")
        .setDescription("Target model (default: auto-detect)")
        .addChoices(...TARGET_CHOICES)
    ),

  new SlashCommandBuilder()
    .setName("showdown")
    .setDescription("Same input, 4 flagship models side by side")
    .addStringOption((o) =>
      o.setName("input").setDescription("Plain English description").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("reverse")
    .setDescription("Reverse-engineer a prompt back to plain English")
    .addStringOption((o) =>
      o.setName("prompt").setDescription("The prompt to reverse").setRequired(true)
    ),
];

// ─── register commands (run once) ─────────────────────────────────────────────

export async function registerCommands(): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
  await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), {
    body: commands.map((c) => c.toJSON()),
  });
  console.log("Slash commands registered.");
}

// ─── bot client ───────────────────────────────────────────────────────────────

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", () => {
  console.log(`PromptForge bot ready as ${client.user?.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  switch (interaction.commandName) {
    case "forge":
      await handleForge(interaction);
      break;
    case "showdown":
      await handleShowdown(interaction);
      break;
    case "reverse":
      await handleReverse(interaction);
      break;
  }
});

// ─── entrypoint ───────────────────────────────────────────────────────────────

const mode = process.argv[2];
if (mode === "register") {
  registerCommands()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
} else {
  client.login(DISCORD_TOKEN);
}
