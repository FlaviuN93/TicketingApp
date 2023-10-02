import axios from 'axios'

const buildClient = ({ req }) => {
  if (typeof window === 'undefined')
    // we are on the server
    return axios.create({
      baseURL: 'http://www.ticketing-test-microservices.site/',
      headers: req.headers,
    })
  // we are on the client
  else return axios.create({ baseURL: '/' })
}

export default buildClient
