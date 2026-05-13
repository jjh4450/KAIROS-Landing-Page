## Project Configuration

- **Language**: TypeScript
- **Package Manager**: pnpm
- **Add-ons**: prettier, eslint, tailwindcss, sveltekit-adapter, paraglide, mdsvex, mcp

---

## ⚠️ Svelte import 정리 시 주의 (IDE auto-import-cleanup)

**문제**: WebStorm/VSCode 의 "Optimize Imports" 또는 ESLint `unused-imports` rule 이 `<ArrowDown />`, `<Trophy />` 처럼 **템플릿에서만 참조되는 컴포넌트 import** 를 "unused" 로 잘못 판단해 제거할 수 있다. TypeScript 가 .svelte 의 템플릿을 분석하지 못해 생기는 false-positive. 한 번에 여러 파일에 적용되면 SSR 500 에러가 광범위하게 발생.

**예방**:

1. **`.svelte` 파일에서는 자동 import 정리를 끄거나 수동 확인할 것.** (WebStorm 의 경우 `Settings → Editor → Code Style → TypeScript → Auto-import → Add imports for unambiguous imports on the fly` 만 켜두고 "Optimize imports on the fly" 는 .svelte 에 적용되지 않게.)
2. **커밋 전 반드시 검증**:
   ```bash
   pnpm run verify   # = lint + check (prettier check + eslint + svelte-check)
   ```
   `svelte-check` 는 템플릿 references 를 이해하므로 잘못 제거된 import 를 잡아낸다.
3. 대규모 import 정리 후엔 `pnpm dev` 로 hero, posts, achievements, members, login 각 페이지를 한 번씩 띄워본다.

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
