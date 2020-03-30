"use strict";

const express = require('express')
const app = express()
const port = 80

const auth = process.env.AUTH || undef;

const zone_id = process.env.ZONE_ID || undef;

const AWS = require('aws-sdk');
var route53 = new AWS.Route53();

app.enable('trust proxy');

function is_auth(query) {
	if (typeof query.hostname === "undefined") {
		return false;
	}

	if (query.hostname.split("-")[1] != auth) {
		return false;
	}
		return true;
}

app.get('/nic/update', (req, res) => { 
	if (is_auth(req.query)) {
		console.log(`Authorized ${req.originalUrl} ${req.ip}`);
	} else {
		console.log(`Unauthorized ${req.originalUrl} ${req.ip}`);
		res.status(403).end();
		return;
	}

	if ( typeof req.query.myip === "undefined" ) {
		console.log(`Malformed request ${req.originalUrl} ${req.ip}`);
		res.status(403).end();
		return;
	}
	
var params = {
  ChangeBatch: {
   Changes: [
      {
     Action: "UPSERT", 
     ResourceRecordSet: {
      Name: req.query.hostname.split("-")[0],
      ResourceRecords: [
         {
        Value: req.query.myip
       }
      ], 
      TTL: 60, 
      Type: "A"
     }
    }
   ], 
   Comment: "Automatic update by butler."
  }, 
  HostedZoneId: zone_id
 };

	var update = route53.changeResourceRecordSets(params, function(err, data) {
		if (err)  {
			console.log(err, err.stack);
			return false;
   		} else     {
			console.log(data);
			return true;        // successful response
		}
 	});

	if (update) {
		res.status(200).send(`good ${req.query.myip}`).end();
	} else {
		res.status(200).send('911').end();
	}
})

app.listen(port, () => console.log('Started.'))
