const axios = require('axios');
const config = require('./config');
const GraphQL = require('./graphql');
const fs = require('fs').promises;

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const DEEPSOURCE_BASEURL = "https://api.deepsource.io";

const GRAPH_QL_QUERY = `{ 
    account(login: "wexinc", vcsProvider: GITHUB) {
        login
        id
    }
}`;

const DEEPSOURCE_GRAPHQL_QUERY = `query ActiveRepositories($cursor: String) {
  account(login: "wexinc", vcsProvider: GITHUB) {
    repositories(first: 100, after: $cursor) {
      edges {
        node {
          id
          name
          latestCommitOid
          isPrivate
          isActivated
          defaultBranch
          dsn
          analysisRuns {
            edges {
              node {
                runUid
              }
            }
          }
          reports {
            owaspTop10 {
              key
              currentValue
              status
              values(startDate: "2024-02-01", endDate: "2024-03-01") {
                date
                values {
                  key
                  value
                }
              }
              trends {
                label
                value
                changePercentage
              }
              securityIssueStats {
                key
                title
                occurrence {
                  critical
                  major
                  minor
                  total
                }
              }
            }
          }
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}`;


const DeepSourceService = {

    async CreateReport() {
        try {
            const results = await GraphQL.postQuery(DEEPSOURCE_GRAPHQL_QUERY);
             // save repository reports to file
             let fileCount = 0;
             results.data.account.repositories.edges.forEach(async repository => {
               fileCount++;
               await this.saveJsonToFile(repository, `./report/repo_${fileCount}.json`);
             }); 
            //console.log('results', JSON.stringify(results));
            
            let endCursor = results.data.account.repositories.pageInfo.endCursor;
            let hasNextPage = results.data.account.repositories.pageInfo.hasNextPage;
            // get all pages
            while(hasNextPage) {
              console.log(`${endCursor}[${hasNextPage}] results : ${fileCount}`);
              const nextResults = await GraphQL.postQuery(DEEPSOURCE_GRAPHQL_QUERY, {cursor: endCursor});
              endCursor = nextResults.data.account.repositories.pageInfo.endCursor;
              hasNextPage = nextResults.data.account.repositories.pageInfo.hasNextPage;

              // save repository reports to file
              results.data.account.repositories.edges.forEach(async repository => {
                fileCount++;
                await this.saveJsonToFile(repository, `./report/repo_${fileCount}.json`);
              }); 
            }

            console.log("Done:", fileCount);
            // save repository reports to file
            // let fileCount = 0;
            // results.data.account.repositories.edges.forEach(async repository => {
            //   fileCount++;
            //   await this.saveJsonToFile(repository, `./report/repo_${fileCount}.json`);
            // }); 
            
            // return results;
        } catch (err) {
            console.error('Error making API call:', err);
            throw err;
        }
    },

    // Save JSON data to a file
    async saveJsonToFile(jsonData, jsonFile = 'report.json') {
        try {
          await fs.writeFile( jsonFile , JSON.stringify(jsonData, null, 2));
      } catch (error) {
          console.error(`Error creating file: ${jsonFile}`);
      }
    }

   
  
}

module.exports = DeepSourceService;