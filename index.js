
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');

exports.handler = function(event, context, cb) {
	
	process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

	const outputName = event.outputName;
	const templateVars = event.templateVars;
	var templatePath = path.join(__dirname, 'template.html');

	var html = fs.readFileSync(templatePath,'utf8')
	
	if(!Array.isArray(templateVars)){
		cb(`422, please provide an array of Template Variables (templateVars)`);
		return false;
	}	
	
	// example
	// {
	//	"outputName": "testbar",
	// 	"templateVars": [
	// 		{"name":"primaryColor", "value": "#CCC"},
	// 		{"name": "secondaryColor", "value": "#CCC"},
	// 		{"name": "generation", "value": 3}
	// 		]
	//   }
	for (var i = 0; i < templateVars.length; i++) {
		var re = new RegExp(`\\{\\{${templateVars[i].name}}}`,"g");
		console.log(re);
		
		html = html.replace(re, templateVars[i].value);
	}
	
	html = html.replace(/\r?\n|\r/g, ' ');
    console.log('after proc');
    console.log(html);

	const targetBucket = process.env['BUCKET'];

	const targetFilename = `${outputName}.html`;

	// upload the file
	const s3 = new AWS.S3();
	params = {
		ACL: 'public-read',
		Key: targetFilename,
		Body: html,
		Bucket: targetBucket,
		ContentType: 'text/html',
		}
	s3.putObject(params, function(err, data) {
		if (err) {
			console.log(err, err.stack);
		} else {
			console.log(data);
			cb(null, {
				key: `${targetFilename}`,
				bucket: targetBucket,
				url: `https://s3.amazonaws.com/${targetBucket}/${targetFilename}`
			});
		}    	  
	});

}