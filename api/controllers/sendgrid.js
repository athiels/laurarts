const fs = require('fs');
const sg = require('sendgrid')(process.env.SENDGRID_API_KEY);


module.exports.sendMail = async(options) => {
  return new Promise(async function(resolve, reject) {
    let body = {
      personalizations: [{
          "to": options.recipients,
          "subject": options.subject
        }],
      from: {
        "email": "no-reply@galerijthiels.be",
        "name": "Galerij Thiels"
      },
      content: [{
        type: 'text/html',
        value: options.content
      }]
    };
    
    if (options.from) body.from = options.from;

    const request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: body
    });

    sg.API(request, function(err, response) {
      if (err) return reject(err);
      return resolve(response);  
    });
  });
}

module.exports.sendTemplateMail = async (mailOptions, contentOptions) => {
  return new Promise(async function(resolve, reject) {

    fs.readFile(`${process.cwd()}/email-templates/${contentOptions.template}.html`, 'utf8', async (err, contents) => {
      if (err) return reject(err);

      mailOptions.content = substitute(contents, contentOptions.substitution);
      try { 
        let sendMailResponse = await exports.sendMail(mailOptions);
        return resolve(sendMailResponse);
      } catch(err) { return reject(err); }
    });
  });
}


function substitute(contents, substitution) {
  const keys = Object.keys(substitution);
  if (!keys.length) return contents;
  keys.forEach(key => {
    contents = contents.replace(`{{${key}}}`, substitution[key]);
  });
  return contents;
}