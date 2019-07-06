const got = require('got');
const debug = require('util').debuglog('wunderbot');

// https://developer.wunderlist.com/documentation
const WUNDERLIST_API_URL = 'https://a.wunderlist.com/api/v1/';

module.exports = class WunderlistApi {
    constructor(clientId, accessToken) {
        this.clientId = clientId;
        this.accessToken = accessToken;
    }

    _apiRequest(endpoint, body, options) {
        const url = `${WUNDERLIST_API_URL}${endpoint}`;

        debug(`Requesting ${url}...`);

        return got(url, {
            body,
            options,
            json: true,
            headers: {
                'X-Client-ID': this.clientId,
                'X-Access-Token': this.accessToken,
            }
        })
        .then(response => response.body)
        .catch(err => {
            debug(err.body && err.body.error || err);
            throw err;
        });
    }

    getLists() {
        return this._apiRequest('lists');
    }

    getInbox() {
        return this.getLists()
            .then(lists => lists.filter(list => list.list_type === 'inbox')[0]);
    }

    createTask({listId, title, assigneeId, completed, recurrenceType, recurrenceCount, dueDate, starred}) {
        return this._apiRequest('tasks', {
            list_id: listId,
            title,
            assignee_id: assigneeId,
            completed,
            recurrence_type: recurrenceType,
            recurrence_count: recurrenceCount,
            due_date: dueDate,
            starred
        }, { method: 'post' });
    }

    getNotes(taskId) {
        return this._apiRequest('notes', { task_id: taskId });
    }

    createNote(taskId, content) {
        return this._apiRequest('notes', {
            task_id: taskId,
            content
        });
    }
};
