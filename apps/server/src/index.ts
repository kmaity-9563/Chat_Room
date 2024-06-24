import  http from "http"
import SocketServices from './services/socket'
import {consumerMessage} from './services/kafka'

async function init() {
        consumerMessage()
        const httpServer = http.createServer()
        const socketservices = new SocketServices()

        const PORT = process.env.PORT ? process.env.PORT : 8000
        socketservices.io.attach(httpServer)

        socketservices.initListeners()

        httpServer.listen(PORT , () => {
           console.log(`server listening on PORT:${PORT}`)
        })
}

init();