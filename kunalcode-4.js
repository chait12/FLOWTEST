var request = require('request');

module.exports = function(){

    this.id = "activecampaign-campaign-create";
    this.label = "Add New Campaign";

    this.input = {
        "title": "Add New Campaign",
        "type": "object",
        "properties": {
            "connection": {
                "title": "Connect to ActiveCampaign",
                "type": "string",
                "minLength": 1,
                "connection": "activecampaign"
            },
            "name": {
                "title": "Name",
                "type": "string",
                "description": "The internal campaign name. Example: 'Friday Newsletter'",
                "minLength": 1
            },
            "message_id": {
                "title": "Message ID",
                "type": "string",
                "description": "Select/specify message ID to use",
                "minLength": 1,
                "lookup": {
                    "id": "a2",
                    "service": "activecampaign",
                    "auth": "connection",
                    "enabled": true,
                    "dependencies": [
                        "connection"
                    ]
                }
            },
            "list": {
                "title": "List ID",
                "type": "string",
                "description": "Select/Specify list ID. Example: 3 to be added with this campaign",
                "minLength": 1,
                "lookup": {
                    "id": "a3",
                    "service": "activecampaign",
                    "auth": "connection",
                    "enabled": true,
                    "dependencies": [
                        "connection"
                    ]
                }
            },
            "type": {
                "title": "Type",
                "type": "string",
                "enum": [
                    "single",
                    "recurring",
                    "split",
                    "responder",
                    "reminder",
                    "special",
                    "activerss",
                    "text"
                ],
                "description": "Select campaign type"
            },
            "sdate": {
                "title": "Sending Date",
                "type": "string",
                "description": "The date when the campaign should be sent out (not used for campaign types 'responder', 'reminder', 'special'). Example: '2010-11-05 08:40:00'"
            },
            "status": {
                "title": "Status",
                "type": "string",
                "enum": [
                    "1",
                    "0"
                ],
                "description": "The status of the campaign. Example: 0 = draft, 1 = scheduled"
            },
            "public": {
                "title": "Visibility of The Campaign",
                "type": "string",
                "enum": [
                    "1",
                    "0"
                ],
                "description": "The visibility of the campaign - if the campaign should be visible on the public side. Example: 1 = visible, 0 = not visible."
            },
            "tracklinks": {
                "title": "Tracklinks",
                "type": "string",
                "enum": [
                    "all",
                    "mime",
                    "html",
                    "text",
                    "none"
                ],
                "description": "Whether or not to track links, and what type of links to track. Examples: 'all', 'mime', 'html', 'text', 'none'. Setting this value to 'all' will let the system know to fetch, parse, and track all emails it finds in both TEXT and HTML body. If mime/html/text is provided, then variable 'links' also must exist, with a list of URLs to track. Choosing 'html' or 'text' will track only the links in that message body."
            }
        }
    };

    this.help = "Service to create and send new campaigns immediately or scheduled for the future";

    this.output = {
        "title": "output",
        "type": "object",
        "properties": {
            "id": {
                "title": "id",
                "type": "integer",
                "displayTitle": "ID"
            },
            "result_code": {
                "title": "result_code",
                "type": "integer",
                "displayTitle": "Result Code"
            },
            "result_message": {
                "title": "result_message",
                "type": "string",
                "displayTitle": "Message"
            },
            "result_output": {
                "title": "result_output",
                "type": "string",
                "displayTitle": "Output"
            }
        }
    };

    this.execute = function(input,output){
        var campaignJSON = {
            name: input.name,
            type: input.type
        };
        if (input.list){
            var list = (input.list).split(',');
            list.forEach(function(listId,i) {
                campaignJSON["p["+listId+"]"]= listId
            })
        }

        campaignJSON['m['+input.message_id+']'] = 100;

        campaignJSON = getObj(input.sdate, "sdate", campaignJSON);
        campaignJSON = getObj(input.status, "status", campaignJSON);
        campaignJSON = getObj(input.public, "public", campaignJSON);
        campaignJSON = getObj(input.tracklinks, "tracklinks", campaignJSON);

        var URL = 'http://'+ input.connection.account +'.api-us1.com/admin/api.php';

        var qs = {
            api_key: String(input.connection.api_key).trim(),
            api_action: "campaign_create",
            api_output: "json"
        };
        request.post({
            url:URL,
            qs: qs,
            form: campaignJSON,
            json:true
        }, function(err, response, body){
            if(err){
                return output(err);
            }
            else{
                if(response.statusCode && response.statusCode >=200 && response.statusCode < 400){
                    if(typeof(body)=="string"){
                        body = JSON.parse(body);
                    }
                    return output(null, body);
                }
                return output(body);
            }
        })
    };
};

function getObj(val, key, obj){
    if(val){
        obj[key] = val;
    }
    return obj;
}