{
  "query":"subscription OnSlurmResponse($input:TestId){slurmResponse(input: $input){id}}",
  "operationName": "GetBestSellers",
  "variables": { "id": 100 }
}


curl --request POST \
  -H 'Content-Type: application/json' \
  --data '{"query":"subscription OnSlurmResponse($input:TestId){slurmResponse(input: $input){id}}","operationName":"OnSlurmResponse","variables":{"id":100}}' \
  http://localhost:5862/graphql
