import { isPublished, type Publication } from './publication.ts';

export interface RoadmapLesson {
  paragraphs: readonly string[];
  points?: readonly { term: string; text: string }[];
  example?: string;
  tryThis: string;
  references: readonly { title: string; url: string }[];
}

export interface RoadmapCheckpoint {
  id: string;
  title: string;
  summary: string;
  noteSlug?: string;
  lesson?: RoadmapLesson;
  video?: Publication & {
    youtubeId: string;
    title: string;
    poster?: string;
  };
}

export interface RoadmapChapter {
  id: string;
  title: string;
  checkpoints: readonly RoadmapCheckpoint[];
}

export const tokenTipsChapters: readonly RoadmapChapter[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    checkpoints: [
      {
        id: 'cheaper-tokens',
        noteSlug: 'cheaper-tokens-wont-fix-a-vague-task',
        title: "Cheaper tokens won't fix a vague task",
        summary: 'Consider the whole job: attempts, review, repair, and a useful result.',
        video: {
          youtubeId: 'oVPT_51ld44',
          title: "GitHub Copilot: Cheaper Tokens Won't Fix a Vague Task | Token Tips 01",
          poster: 'token-tips-01-thumbnail.png',
          status: 'published',
          approvedForPublication: true,
          publishedAt: new Date('2026-10-19T18:42:50Z'),
        },
        lesson: {
          paragraphs: [
            'Imagine sending prospectors into the mountains with one instruction: find the gold. When they return empty-handed, you negotiate cheaper shovels. Each attempt might cost less, but nobody has a better lead. A coding agent can be just as busy without getting closer to the result you wanted.',
            'The useful comparison is the whole job, not one request. Include the attempts, your review, and any repair. A slightly longer prompt that names the actual problem can be worth more than a shorter prompt that leaves the agent guessing. Cheaper models still have a place; use one that can meet the task, rather than assuming either a low price or a powerful model will compensate for an unclear job.',
          ],
          tryThis: 'Before your next Copilot request, replace a vague phrase such as "improve checkout" with the behavior you want changed and how the agent will know when it is complete. This lets you judge the result, not the confidence of the answer.',
          references: [
            { title: 'VS Code: Optimize AI credit usage', url: 'https://code.visualstudio.com/docs/agents/guides/optimize-usage' },
          ],
        },
      },
      {
        id: 'clear-target',
        title: 'Give the agent a clear target',
        summary: 'State what you know, what needs to change, and how you will know it is done.',
        lesson: {
          paragraphs: [
            '"Improve checkout" asks the agent to choose the problem, the scope, and the finish line. A useful task brief makes those choices explicit without prescribing an unproven fix. Start with three things:',
          ],
          points: [
            { term: 'Evidence', text: 'Give a reproduction, an error, or an observed result. Separate what you know from what you suspect.' },
            { term: 'Scope', text: 'Say what should change and what must keep working. A likely file is a lead, not proof of the cause.' },
            { term: 'Finish line', text: 'Describe observable behavior and the check that would demonstrate it.' },
          ],
          example: 'Fix the error when an empty cart reaches checkout.\nAn empty cart should show a helpful message and submit no order.\nValid carts must still complete checkout.\nAdd regression coverage for both cases.',
          tryThis: 'Use evidence, scope, and a finish line for one real bug in Copilot Chat. Ask Copilot to restate the success criteria before editing. Then review the changes and run the agreed checks yourself; passing tests are evidence, not a substitute for reviewing the requirement.',
          references: [
            { title: 'VS Code: Write effective prompts', url: 'https://code.visualstudio.com/docs/agents/best-practices#_write-effective-prompts' },
          ],
        },
      },
      {
        id: 'agent-context',
        title: "What goes into an agent's context?",
        summary: 'Follow prompts, instructions, files, history, and tool results through the agent loop.',
        lesson: {
          paragraphs: [
            'Your message is only part of what the model receives. VS Code assembles context from sources such as instructions, conversation history, attached files, and tool results. Editor context can also contribute, but its behavior varies by interface and settings. If a file matters, attach it explicitly rather than assuming an open tab supplies the whole file.',
            'The model does not browse your repository by itself. It can request a tool; the agent runs that tool and supplies the result for a later model request. A search can lead to a file read, which can lead to a test run. Those results become more context. An indexed repository helps locate relevant code; it does not mean the entire repository is sent with every request.',
          ],
          tryThis: 'In VS Code Chat, use Add Context to attach a small relevant file. Ask: "Explain how this function handles an empty input. Name the files and symbols you use as evidence. Do not edit code." Follow the references back to the code and check the explanation.',
          references: [
            { title: 'VS Code: Understand context', url: 'https://code.visualstudio.com/docs/agents/concepts/context' },
            { title: 'VS Code: Add context to chat', url: 'https://code.visualstudio.com/docs/chat/copilot-chat-context' },
          ],
        },
      },
      {
        id: 'token-types',
        title: 'Input, output, and cached tokens',
        summary: 'Understand the different token categories before trying to reduce them.',
        lesson: {
          paragraphs: [
            'Tokens are the pieces a model processes, not a count of words or characters. The price of an interaction depends on both the model and the types and amounts of tokens involved. Three useful categories are:',
          ],
          points: [
            { term: 'Input', text: 'Information sent to the model for a request, including instructions, relevant history, files, and tool results, not just the message you typed.' },
            { term: 'Output', text: 'What the model generates. For reasoning models, usage can also include thinking tokens, not just the visible answer.' },
            { term: 'Cached input', text: 'Eligible repeated prompt content reused by the provider. Reusing a matching prefix can reduce cost and latency, but a cache hit is not guaranteed and is not a saved answer.' },
          ],
          example: 'A short question + a large attached log = substantial input.\nA short prompt + a long generated rewrite = substantial output.',
          tryThis: 'In VS Code, hover over the model picker to inspect the token-type rates, then inspect session usage through the context-window control after a small Copilot task. Use the breakdown to choose what to investigate. Do not assume all tokens have one price, cached input is free, or fewer prompt words always mean a cheaper completed task.',
          references: [
            { title: 'GitHub: How Copilot usage is billed', url: 'https://docs.github.com/en/copilot/concepts/billing-and-usage/individuals/billing' },
            { title: 'VS Code: Inspect token usage and caching', url: 'https://code.visualstudio.com/docs/agents/guides/optimize-usage#_inspect-token-usage-and-caching' },
          ],
        },
      },
      {
        id: 'context-quality',
        title: "More context isn't always better",
        summary: 'Keep relevant evidence in focus rather than filling the window with competing information.',
        lesson: {
          paragraphs: [
            "A context window is a capacity limit, not a target to fill. An exact error and the code that produced it can be more useful than pages of unrelated logs. Extra material can introduce competing instructions, distract from the task, and consume space without helping the model decide what to do.",
            'Do not solve that by withholding necessary evidence. Start with the goal, constraints, a reproduction, and useful leads; let the agent inspect related code as needed. Keep the conversation on one task. In long chats, older details may be summarized, so preserve the decisions and checks you still need rather than assuming every early message remains available verbatim.',
          ],
          tryThis: 'When a Copilot chat drifts, write a short handoff with the goal, constraints, current failure, relevant files, and useful findings. Use it to start a fresh chat and ask what evidence is still missing before making changes. Keep the old conversation available; a fresh chat is not an automatic transfer of its history.',
          references: [
            { title: 'VS Code: Work effectively with context', url: 'https://code.visualstudio.com/docs/agents/concepts/context#_working-effectively-with-context' },
          ],
        },
      },
    ],
  },
  {
    id: 'workflow',
    title: 'Workflow and model choice',
    checkpoints: [
      {
        id: 'research-plan-implement',
        title: 'Research, plan, then implement',
        summary: 'Separate discovery from execution when it helps, and carry forward a reviewed plan.',
      },
      {
        id: 'model-choice',
        title: 'Match the model to the work',
        summary: 'Choose the capability the task needs, not always the cheapest or most powerful model.',
      },
      {
        id: 'auto-selection',
        title: 'When to use Auto',
        summary: 'Explore automatic model selection, its trade-offs, and when to choose explicitly.',
      },
      {
        id: 'cache',
        title: 'Preserve useful cache',
        summary: 'Understand eligible repeated context and the limits of cache-aware choices.',
      },
      {
        id: 'reasoning-effort',
        title: 'Choose reasoning effort deliberately',
        summary: 'Weigh additional reasoning against the difficulty of the task, latency, and cost.',
      },
      {
        id: 'focused-sessions',
        title: 'Keep sessions focused',
        summary: 'Handle unrelated tasks, compaction, and fresh sessions without losing necessary evidence.',
      },
    ],
  },
  {
    id: 'guidance',
    title: 'Reusable guidance and controls',
    checkpoints: [
      {
        id: 'project-instructions',
        title: 'Keep project instructions lean',
        summary: 'Keep shared build, test, and repository guidance short; scope local rules to the work.',
      },
      {
        id: 'skills',
        title: 'Load procedures when needed',
        summary: 'Use task-specific skills instead of putting every procedure into always-on instructions.',
      },
      {
        id: 'custom-agents',
        title: 'Give custom agents a clear role',
        summary: 'Define focused responsibilities, instructions, and appropriate tool access.',
      },
      {
        id: 'subagents',
        title: 'Delegate a bounded investigation',
        summary: 'Use a subagent for a focused question, with a useful report and a reason to delegate.',
      },
      {
        id: 'tool-selection',
        title: 'Enable the tools the task needs',
        summary: 'Consider MCP tool descriptions, context overhead, and unnecessary action choices.',
      },
      {
        id: 'early-checks',
        title: 'Catch mistakes early',
        summary: 'Use relevant tests, builds, linters, and other deterministic feedback.',
      },
      {
        id: 'hooks',
        title: 'Instructions guide; hooks run checks',
        summary: 'Distinguish behavioral guidance from configured checks and their enforcement limits.',
      },
      {
        id: 'scripts',
        title: 'Script repeatable work',
        summary: 'Use scripts or CI for repeated steps that do not need fresh reasoning.',
      },
      {
        id: 'context-placement',
        title: 'Put context in the right place',
        summary: 'Choose between a prompt, instructions, skills, agents, tools, and scripts.',
      },
    ],
  },
  {
    id: 'large-repositories',
    title: 'Large repositories',
    checkpoints: [
      {
        id: 'retrieval',
        title: 'Retrieve before you reason',
        summary: 'Find relevant code with semantic, text, symbol, and file search, including non-indexed fallbacks.',
      },
      {
        id: 'starting-points',
        title: 'Give the agent a useful starting point',
        summary: 'Share relevant files, symbols, dependencies, and a reproduction; label unconfirmed causes.',
      },
      {
        id: 'tool-output',
        title: 'Keep tool output useful',
        summary: 'Target tests and filter repetition while preserving failures and access to full evidence.',
      },
      {
        id: 'handoffs',
        title: 'Carry decisions, not the whole chat',
        summary: 'Hand off requirements, findings, scope, references, validation, and unresolved questions.',
      },
    ],
  },
  {
    id: 'measurement',
    title: 'Measure and improve',
    checkpoints: [
      {
        id: 'usage',
        title: 'Observe usage before changing habits',
        summary: 'Inspect available context and usage signals before deciding what to optimize.',
      },
      {
        id: 'accepted-result',
        title: 'Measure cost through an accepted result',
        summary: 'Compare similar tasks, counting retries, review, repair, elapsed time, and quality.',
      },
      {
        id: 'team-guardrails',
        title: 'Set useful team guardrails',
        summary: 'Make paid usage deliberate, choose sensible defaults, and measure outcomes as well as spend.',
      },
      {
        id: 'next-move',
        title: 'Choose the next move',
        summary: 'Apply the ideas to everyday decisions, then try one practice and compare repeated outcomes.',
      },
    ],
  },
];

interface RoadmapNote {
  data: Publication & {
    slug: string;
    series?: string;
    kind?: string;
    title?: string;
    youtubeId?: string;
  };
}

export function resolveTokenTipsRoadmap<T extends RoadmapNote>(
  notes: readonly T[],
  now = new Date(),
) {
  const published = new Map(notes
    .filter(({ data }) => data.series === 'token-tips' && isPublished(data, now))
    .map((note) => [note.data.slug, note]));
  let sequence = 0;
  return tokenTipsChapters.map((chapter) => ({
    ...chapter,
    checkpoints: chapter.checkpoints.map((checkpoint) => {
      const note = published.get(checkpoint.noteSlug ?? checkpoint.id);
      const video = note?.data.kind === 'video' && note.data.youtubeId
        ? {
          ...note.data,
          youtubeId: note.data.youtubeId,
          title: note.data.title ?? checkpoint.title,
          poster: checkpoint.video?.youtubeId === note.data.youtubeId ? checkpoint.video.poster : undefined,
        }
        : checkpoint.video && isPublished(checkpoint.video, now) ? checkpoint.video : undefined;
      return {
        ...checkpoint,
        number: ++sequence,
        note,
        video,
      };
    }),
  }));
}

export function standaloneTokenTipsVideos<T extends RoadmapNote>(
  notes: readonly T[],
  now = new Date(),
) {
  return resolveTokenTipsRoadmap(notes, now).flatMap(({ checkpoints }) => checkpoints
    .flatMap(({ id, summary, video, note }) => video && !note ? [{
      id,
      title: video.title,
      description: summary,
      publishedAt: video.publishedAt!,
    }] : []));
}
