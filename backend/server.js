const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
const { OPCUAClient, MessageSecurityMode, SecurityPolicy, AttributeIds } = require('node-opcua')

const app = express()
app.use(cors())

const servidorHttp = http.createServer(app)
const io = new Server(servidorHttp, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
})

const ENDPOINT = 'opc.tcp://169.254.171.199:4840'
const URI_NAMESPACE = 'http://vue'

// Mapeamento dos Node IDs do TIA Portal
const IDS = {
    plastico: 3, // http://vue;i=3 (vermelhas)
    vidro: 4,    // http://vue;i=4 (verdes)
    metal: 5,    // http://vue;i=5 (amarelas)
    total: 6     // http://vue;i=6 (total)
}

let conectadoOpc = false
let dados = {
    contPecasPlastico: 0,
    contPecasVidro: 0,
    contPecasMetal: 0,
    contPecasTotal: 0
}

app.get('/', (req, res) => res.json({
    backend: 'Funcionando',
    opcUa: conectadoOpc ? 'Conectado' : 'Desconectado',
    producao: dados
}))

io.on('connection', socket => {
    socket.emit('opcStatus', conectadoOpc)
    socket.emit('dadosProducao', dados)
})

async function iniciarOpcUa() {
    const cliente = OPCUAClient.create({
        endpointMustExist: false,
        securityMode: MessageSecurityMode.None,
        securityPolicy: SecurityPolicy.None
    })

    try {
        await cliente.connect(ENDPOINT)
        const sessao = await cliente.createSession()
        const resposta = await sessao.read({ nodeId: 'i=2255', attributeId: AttributeIds.Value })
        const indice = resposta.value.value.indexOf(URI_NAMESPACE)

        if (indice < 0) throw new Error('Namespace não encontrado')

        const nos = Object.values(IDS).map(id => ({
            nodeId: `ns=${indice};i=${id}`,
            attributeId: AttributeIds.Value
        }))

        conectadoOpc = true
        io.emit('opcStatus', true)

        setInterval(async () => {
            try {
                const valores = await sessao.read(nos)
                dados = {
                    contPecasPlastico: Number(valores[0].value.value ?? 0),
                    contPecasVidro: Number(valores[1].value.value ?? 0),
                    contPecasMetal: Number(valores[2].value.value ?? 0),
                    contPecasTotal: Number(valores[3].value.value ?? 0)
                }
                if (!conectadoOpc) {
                    conectadoOpc = true
                    io.emit('opcStatus', true)
                }
                io.emit('dadosProducao', dados)
            } catch (erro) {
                conectadoOpc = false
                io.emit('opcStatus', false)
            }
        }, 500)
    } catch (erro) {
        conectadoOpc = false
        io.emit('opcStatus', false)
        console.log('Falha OPC UA:', erro.message)
    }
}

servidorHttp.listen(3000, () => {
    console.log('Backend em http://localhost:3000')
    iniciarOpcUa()
})