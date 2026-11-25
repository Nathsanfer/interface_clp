# Interface CLP — Painel de Separação por Cores

Aplicação web para monitoramento em tempo real de uma linha automatizada de triagem de peças por cor (**Verde**, **Amarelo** e **Vermelho**), integrada a um CLP **Siemens S7-1500** via protocolo **OPC UA**.

## Arquitetura

```text
CLP Siemens S7-1500 (OPC UA :4840)
        │  Leitura a cada 500 ms (node-opcua)
        ▼
Backend Node.js + Express + Socket.IO (http://localhost:3000)
        │  WebSocket em tempo real (socket.io)
        ▼
Frontend Vue 3 + Vite (http://localhost:5173)
```

## Tecnologias

- **Frontend:** Vue 3, Vite, `socket.io-client`
- **Backend:** Node.js, Express, `socket.io`, `cors`, `node-opcua`
- **Automação:** CLP Siemens S7-1500 / TIA Portal (Servidor OPC UA)

## Estrutura do Projeto

```text
interface_clp/
├── backend/
│   ├── package.json       # Dependências do servidor OPC UA / Socket.IO
│   └── server.js          # Cliente OPC UA + servidor HTTP/WebSocket (porta 3000)
├── src/
│   ├── App.vue            # Interface principal do painel de separação
│   ├── main.js            # Ponto de entrada do Vue
│   └── styles.css         # Estilos globais
├── index.html
├── package.json           # Dependências e scripts do frontend
├── vite.config.js
└── README.md
```

## Pré-requisitos

- **Node.js** `^22.18.0` ou `>=24.12.0` (com `npm`)
- **CLP Siemens S7-1500** (físico ou simulado via **PLCSIM Advanced**) em modo `RUN`
- Servidor **OPC UA** ativado no TIA Portal, com segurança `None` habilitada e acessível pela rede

## Configuração OPC UA

Antes de iniciar, confirme em `backend/server.js` se o endereço do CLP, o namespace e os Node IDs correspondem ao seu projeto no TIA Portal:

- **Endpoint:** `opc.tcp://169.254.171.199:4840`
- **Namespace URI:** `http://vue`
- **Segurança:** `MessageSecurityMode.None` / `SecurityPolicy.None`

| Cor / Dado | Variável no CLP (TIA Portal) | Node ID (`http://vue`) | Campo enviado ao frontend |
| ---------- | ---------------------------- | ---------------------- | ------------------------- |
| Vermelho   | `contPecasVermelhas`         | `i=3`                  | `contPecasVermelhas`      |
| Verde      | `contPecasVerdes`            | `i=4`                  | `contPecasVerdes`         |
| Amarelo    | `contPecasAmarelas`          | `i=5`                  | `contPecasAmarelas`       |
| Total      | `contPecasTotal`             | `i=6`                  | `contPecasTotal`          |

> Caso o IP do CLP ou os IDs mudem, ajuste as constantes `ENDPOINT`, `URI_NAMESPACE` e `IDS` em `backend/server.js`.

## Passo a Passo para Execução

### 1. Instalar as dependências

Abra um terminal na pasta raiz do projeto (`interface_clp`) e instale as dependências do **frontend**:

```powershell
npm install
```

Em seguida, instale as dependências do **backend**:

```powershell
cd backend
npm install
cd ..
```

### 2. Verificar a comunicação com o CLP

Certifique-se de que o CLP (ou PLCSIM Advanced) está ligado e na mesma faixa de rede do computador. No PowerShell, você pode testar a porta OPC UA (`4840`):

```powershell
Test-NetConnection -ComputerName 169.254.171.199 -Port 4840
```

O campo `TcpTestSucceeded` deve retornar `True`.

### 3. Iniciar o Backend (Terminal 1)

No primeiro terminal, entre na pasta `backend` e execute o servidor:

```powershell
cd backend
node server.js
```

Saída esperada:

```text
Backend em http://localhost:3000
```

Para confirmar que o backend está lendo o CLP corretamente, acesse http://localhost:3000 no navegador. O retorno deve ser um JSON semelhante a:

```json
{
  "backend": "Funcionando",
  "opcUa": "Conectado",
  "producao": {
    "contPecasVermelhas": 0,
    "contPecasVerdes": 0,
    "contPecasAmarelas": 0,
    "contPecasTotal": 0
  }
}
```

### 4. Iniciar o Frontend (Terminal 2)

Com o backend rodando, abra um **segundo terminal** na pasta raiz do projeto (`interface_clp`) e execute:

```powershell
npm run dev
```

Acesse no navegador o endereço exibido pelo Vite (por padrão, http://localhost:5173). O indicador no topo da tela deve exibir **CLP Conectado** e os contadores serão atualizados automaticamente a cada 500 ms.

## Build para Produção (Opcional)

Para gerar a versão otimizada do frontend na pasta `dist/`:

```powershell
npm run build
```

Para pré-visualizar o build gerado:

```powershell
npm run preview
```

## Solução de Problemas

- **Erro `EADDRINUSE` na porta `3000`:** já existe outra instância do `node server.js` aberta. Feche o terminal anterior (ou pressione `Ctrl + C`) e execute `node server.js` novamente.
- **`opcUa: "Desconectado"` em http://localhost:3000:**
  - Verifique se o CLP/PLCSIM está em `RUN` e se o IP em `ENDPOINT` (`backend/server.js`) está correto.
  - Confirme no TIA Portal se o servidor OPC UA está ativo e aceitando `Security Policy: None`.
  - Verifique se o adaptador de rede do PC está na mesma sub-rede do CLP (ex.: `169.254.x.x`).
- **`Falha OPC UA: Namespace não encontrado`:** verifique se a URI da Server Interface no TIA Portal é exatamente `http://vue` (ou atualize `URI_NAMESPACE` em `backend/server.js`).
- **Backend mostra `"Conectado"`, mas o frontend mostra `CLP Desconectado`:** confirme se o `backend/server.js` está rodando na porta `3000`, reinicie o backend após alterações no arquivo e atualize a página do navegador (`F5`).

## Autoria

- **Instituição:** Faculdade de Tecnologia Senai Roberto Mange — Campinas, SP
- **Autores:** Kauan Magalhães Piacente · Nathalia Santos Ferreira
