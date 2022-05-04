{
  "query":`subscription OnSlurmResponse { slurmResponse {
            start
            end
            referenceName
            ref
            alt
            Consequence
            oAA
            nAA
            FeatureID
            cDNApos
            protPos
            nhomalt
            an
            af
            filter
            transcript
            cdna
            amino_acids
        }
    }`,
  "variables": '[{"start":31655057,"end":31655057,"referenceName":6,"ref":"G","alt":"C","Consequence":"NON_SYNONYMOUS","oAA":"H","nAA":"D","FeatureID":"ENST00000395952","cDNApos":1772,"protPos":537,"nhomalt":"","an":"","af":"","filter":"","transcript":"","cdna":"","amino_acids":""},{"start":31655057,"end":31655057,"referenceName":6,"ref":"G","alt":"C","Consequence":"UPSTREAM","oAA":"","nAA":"","FeatureID":"ENST00000375863","cDNApos":"","protPos":"","nhomalt":"","an":"","af":"","filter":"","transcript":"","cdna":"","amino_acids":""},{"start":31655057,"end":31655057,"referenceName":6,"ref":"G","alt":"T","Consequence":"UPSTREAM","oAA":"","nAA":"","FeatureID":"ENST00000375863","cDNApos":"","protPos":"","nhomalt":"","an":"","af":"","filter":"","transcript":"","cdna":"","amino_acids":""},{"start":31655057,"end":31655057,"referenceName":6,"ref":"G","alt":"T","Consequence":"NON_SYNONYMOUS","oAA":"H","nAA":"N","FeatureID":"ENST00000395952","cDNApos":1772,"protPos":537,"nhomalt":"","an":"","af":"","filter":"","transcript":"","cdna":"","amino_acids":""},{"start":31655057,"end":31655057,"referenceName":6,"ref":"G","alt":"T","Consequence":"3PRIME_UTR","oAA":"","nAA":"","FeatureID":"ENST00000461287","cDNApos":2014,"protPos":"","nhomalt":"","an":"","af":"","filter":"","transcript":"","cdna":"","amino_acids":""}]'
}


curl --request POST \
  -H 'Content-Type: application/json' \
  --header "Authorization: Bearer $TOKEN" \
  --data '{"operationName":"OnSlurmResponse","variables":{ "jobId": 50881, "variants": [{"start":31655057,"end":31655057,"referenceName":6,"ref":"G","alt":"C","Consequence":"NON_SYNONYMOUS","oAA":"H","nAA":"D","FeatureID":"ENST00000395952","cDNApos":1772,"protPos":537,"nhomalt":"","an":"","af":"","filter":"","transcript":"","cdna":"","amino_acids":""},{"start":31655057,"end":31655057,"referenceName":6,"ref":"G","alt":"C","Consequence":"UPSTREAM","oAA":"","nAA":"","FeatureID":"ENST00000375863","cDNApos":"","protPos":"","nhomalt":"","an":"","af":"","filter":"","transcript":"","cdna":"","amino_acids":""},{"start":31655057,"end":31655057,"referenceName":6,"ref":"G","alt":"T","Consequence":"UPSTREAM","oAA":"","nAA":"","FeatureID":"ENST00000375863","cDNApos":"","protPos":"","nhomalt":"","an":"","af":"","filter":"","transcript":"","cdna":"","amino_acids":""},{"start":31655057,"end":31655057,"referenceName":6,"ref":"G","alt":"T","Consequence":"NON_SYNONYMOUS","oAA":"H","nAA":"N","FeatureID":"ENST00000395952","cDNApos":1772,"protPos":537,"nhomalt":"","an":"","af":"","filter":"","transcript":"","cdna":"","amino_acids":""},{"start":31655057,"end":31655057,"referenceName":6,"ref":"G","alt":"T","Consequence":"3PRIME_UTR","oAA":"","nAA":"","FeatureID":"ENST00000461287","cDNApos":2014,"protPos":"","nhomalt":"","an":"","af":"","filter":"","transcript":"","cdna":"","amino_acids":""}]}}' \
  http://localhost:5862/graphql
