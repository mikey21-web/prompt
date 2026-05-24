#!/usr/bin/env node
/**
 * PromptForge CLI.
 *
 * Usage:
 *   pf "make a sora prompt: a guy and a cat in a hallway"
 *   pf --target claude-sonnet-4.5 "explain transactions to a 5 year old"
 *   pf --reverse "<role>...</role>"
 *
 * Auth: reads PROMPTFORGE_API_KEY from env. Get one at
 * https://promptforge.dev/settings.
 *
 * The CLI is intentionally a single file with zero runtime dependencies so
 * `npx promptforge` boots in well under a second.
 */

const VERSION = "0.1.0";
const DEFAULT_API = "https://promptforge.dev";

interface Args {
  input: string;
  target?: string;
  reverse: boolean;
  json: boolean;
  copy: boolean;
  showdown: boolean;
  api: string;
  help: boolean;
  version: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    input: "",
    reverse: false,
    json: false,
    copy: false,
    showdown: false,
    api: process.env.PROMPTFORGE_API_URL ?? DEFAULT_API,
    help: false,
    version: false,
  };
  const inputs: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "-h":
      case "--help":
        args.help = true;
        break;
      case "-v":
      case "--version":
        args.version = true;
        break;
      case "-t":
      case "--target":
        args.target = argv[++i];
        break;
      case "--reverse":
      case "-r":
        args.reverse = true;
        break;
      case "--json":
        args.json = true;
        break;
      case "--copy":
      case "-c":
        args.copy = true;
        break;
      case "--showdown":
      case "-s":
        args.showdown = true;
        break;
      case "--api":
        args.api = argv[++i] ?? args.api;
        break;
      default:
        if (a.startsWith("-")) {
          process.stderr.write(`Unknown flag: ${a}\n`);
          process.exit(64);
        }
        inputs.push(a);
    }
  }
  args.input = inputs.join(" ");
  return args;
}

function help() {
  process.stdout.write(
    `PromptForge CLI v${VERSION}

Translate plain English into the optimal prompt for any AI model.

USAGE
  pf <input>                         Translate <input> for the auto-detected model
  pf -t <model> <input>              Translate for a specific model
  pf --showdown <input>              Show all 4 flagship text models side by side
  pf --reverse <prompt>              Reverse-engineer a prompt back to plain English

FLAGS
  -t, --target <model>               Target model id (e.g. claude-sonnet-4.5,
                                     gpt-4o, gemini-2.5-pro, midjourney-v7,
                                     sora-2, suno-v4). Default: auto-detect.
  -s, --showdown                     Run a 4-way Showdown
  -r, --reverse                      Reverse mode (prompt -> English)
  -c, --copy                         Copy output to clipboard (macOS/Linux/Windows)
      --json                         Emit raw JSON instead of pretty output
      --api <url>                    Override API base URL
  -h, --help                         Show this help
  -v, --version                      Print version

ENVIRONMENT
  PROMPTFORGE_API_KEY                Required. Get one at promptforge.dev/settings
  PROMPTFORGE_API_URL                Optional override (defaults to ${DEFAULT_API})

EXAMPLES
  pf "a guy walks into a dark hallway, sees a cat, runs away. cinematic horror"
  pf -t midjourney-v7 "moody sci-fi city at sunset"
  pf --showdown "explain transactions to a 5 year old"
  pf --reverse "<role>You are a senior copywriter</role><task>...</task>"
`
  );
}

async function copyToClipboard(text: string): Promise<void> {
  // Cross-platform: native commands. No deps.
  const { spawn } = await import("node:child_process");
  const platform = process.platform;
  const cmd =
    platform === "darwin"
      ? ["pbcopy", []]
      : platform === "win32"
        ? ["clip", []]
        : ["xclip", ["-selection", "clipboard"]];
  return new Promise((resolve) => {
    const child = spawn(cmd[0] as string, cmd[1] as string[]);
    child.stdin.write(text);
    child.stdin.end();
    child.on("close", () => resolve());
    child.on("error", () => resolve());
  });
}

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return "";
  let data = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) data += chunk;
  return data.trim();
}

async function callApi(
  apiBase: string,
  path: string,
  body: unknown
): Promise<unknown> {
  const apiKey = process.env.PROMPTFORGE_API_KEY;
  if (!apiKey) {
    process.stderr.write(
      "PROMPTFORGE_API_KEY not set. Get a key at https://promptforge.dev/settings\n"
    );
    process.exit(2);
  }
  const res = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    process.stderr.write(`API error ${res.status}: ${text}\n`);
    process.exit(1);
  }
  return res.json();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    help();
    return;
  }
  if (args.version) {
    process.stdout.write(`${VERSION}\n`);
    return;
  }

  // Allow piping: cat prompt.txt | pf -r
  if (!args.input) {
    args.input = await readStdin();
  }
  if (!args.input) {
    help();
    process.exit(64);
  }

  let result: unknown;
  if (args.reverse) {
    result = await callApi(args.api, "/api/reverse", { prompt: args.input });
    if (args.json) {
      process.stdout.write(JSON.stringify(result, null, 2) + "\n");
      return;
    }
    const r = result as { explanation: string };
    process.stdout.write(r.explanation + "\n");
    if (args.copy) await copyToClipboard(r.explanation);
    return;
  }

  if (args.showdown) {
    result = await callApi(args.api, "/api/showdown", {
      input: args.input,
      targets: [
        "claude-sonnet-4.5",
        "gpt-4o",
        "gemini-2.5-pro",
        "midjourney-v7",
      ],
    });
    if (args.json) {
      process.stdout.write(JSON.stringify(result, null, 2) + "\n");
      return;
    }
    const r = result as {
      outputs: { target: string; optimized: string; error: string | null }[];
    };
    for (const out of r.outputs) {
      process.stdout.write(`\n── ${out.target} ──\n\n`);
      if (out.error) process.stdout.write(`(error: ${out.error})\n`);
      else process.stdout.write(out.optimized + "\n");
    }
    return;
  }

  result = await callApi(args.api, "/api/forge", {
    input: args.input,
    target: args.target,
  });
  if (args.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    return;
  }
  const r = result as { optimized: string; target: string };
  process.stdout.write(r.optimized + "\n");
  if (args.copy) await copyToClipboard(r.optimized);
  process.stderr.write(`\n[forged for ${r.target}]\n`);
}

main().catch((e) => {
  process.stderr.write(`Error: ${e instanceof Error ? e.message : e}\n`);
  process.exit(1);
});
