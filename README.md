# AAAgronegocio

Estrutura na raiz do repositório:

| Pasta | Conteúdo |
|-------|-----------|
| **`frontend/`** | App React (Vite); pacote `@workspace/frontend`. Cliente gerado em `frontend/packages/api-client-react/`. |
| **`backend/`** | API Express; pacote `@workspace/backend`. Pacotes internos em `backend/packages/` (`db`, `api-zod`, OpenAPI + Orval em `api-spec`). Utilitários em `backend/scripts/`. |

Comandos úteis (na raiz):

- `npm install`
- `npm run dev` — frontend
- `npm run dev:api` — backend
- `npm run codegen` — gera tipos/hooks a partir do OpenAPI

Variável opcional no frontend: `API_PROXY_TARGET` (proxy `/api` no Vite).
