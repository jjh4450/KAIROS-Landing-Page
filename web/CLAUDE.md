## Project Configuration

- **Language**: TypeScript
- **Package Manager**: pnpm
- **Add-ons**: prettier, eslint, tailwindcss, sveltekit-adapter, paraglide, mdsvex, mcp

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

---

## shadcn-svelte MCP

이 프로젝트는 `shadcn-svelte`를 UI 컴포넌트로 씁니다. 컴포넌트 사용법·props·예제 코드·설치 명령이 필요할 때 `shadcn-svelte` MCP 서버 (Michael-Obele / Mastra Cloud 호스팅, `web/.mcp.json`에 정의)를 활용하세요.

`Button`, `Dialog`, `DropdownMenu` 등의 정확한 import 경로와 사용 패턴을 묻거나, 새 컴포넌트를 추가할 때 (`pnpm dlx shadcn-svelte@latest add <component>`) 먼저 이 MCP로 컴포넌트가 어떻게 구성되는지 확인하면 토큰을 아끼면서 정확한 결과를 얻을 수 있습니다.
