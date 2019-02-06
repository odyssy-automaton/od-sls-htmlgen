
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');

exports.handler = function(event, context, cb) {
	
	process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

	const outputName = event.outputName;
	const name = event.name || '';
	const primaryColor = event.primaryColor || '#fff';
	const secondaryColor = event.secondaryColor || '#000';
	const tertiaryColor = event.tertiaryColor || '#666';
	var templatePath = path.join(__dirname, 'template.html');

	var html = fs.readFileSync(templatePath,'utf8')
  console.log(html);
	
	html = html.replace(/\{\{name}}/g, name);
	html = html.replace(/\{\{primaryColor}}/g, primaryColor);
	html = html.replace(/\{\{secondaryColor}}/g, secondaryColor);
	html = html.replace(/\{\{tertiaryColor}}/g, tertiaryColor);
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