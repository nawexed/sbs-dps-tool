const axios = require('axios');
const https = require('https');
const config = require('./config');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const DEEPSOURCE_BASEURL = "https://api.deepsource.io";

const agent = new https.Agent({  
    rejectUnauthorized: false // WARNING: This bypasses SSL certificate validation. Use with caution.
  });


const GraphQL = {

    /**
     * Makes a POST request to a GraphQL endpoint.
     * @param {string} query - The GraphQL query or mutation.
     * @param {Object} variables - The variables for the GraphQL query or mutation.
     * @returns {Promise<Object>} The data returned by the GraphQL server.
     */
    async postQuery(query, variables = {}) {
        const graphqlQuery = {
            query: query,
            variables: variables
        };
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${config.DEEPSOURCE_ACCESS_TOKEN}` // Assuming DEEPSOURCE_ACCESS_TOKEN is defined in your config
        };

        try {
            const response = await axios.post(
                    DEEPSOURCE_BASEURL + '/graphql/',
                    JSON.stringify(graphqlQuery),// GRAPH_QL_QUERY,
                    {
                        headers: headers,
                        httpsAgent: agent
                    });
            return response.data; // Return the data from the response
        } catch (error) {
            console.error('Error making GraphQL call:', error.message);
            throw error; // Rethrow the error for further handling
        }
    }

}

module.exports = GraphQL;