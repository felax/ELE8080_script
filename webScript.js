const ACCESS_TOKEN = "1/1200959149394509:cac987d5a267917f43de0cf44af6e940";
const bearer = "Bearer " + ACCESS_TOKEN; 
const TEAM_GID = "1200959071559122";
const PROJECT_GID = "1201101399874730";

async function getData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'GET',
        withCredentials: true,
        credentials: 'omit',
        mode: 'cors',
        headers: {
            'Authorization': bearer,
            'Content-Type': 'application/json'
        }
    });
    return response.json(); 
}

async function populateSelect() {
    const projects = await getData("https://app.asana.com/api/1.0/teams/"+TEAM_GID+"/projects?limit=10");
    const select = document.getElementById("projects");
    for (const project of projects.data) {
        const option = document.createElement("option");
        option.value = project.gid;
        option.innerHTML = project.name;
        select.appendChild(option);
    }
}

function validTask(task) {
    const SKIP_GID = "1201158979551455";
    for (const tag of task.tags) {
        if (tag.gid == SKIP_GID) return false;
    }
    return true;
}

function getName(task, users) {
    if (task.assignee) {
        for (const user of users.data) {
            if (user.gid == task.assignee.gid) {
                let name = user.name.split(" ");
                return name[0][0] + name[1][0];
            }
        }
    }
    else {
        return "-"
    }
}

function getDate(task) {
    if (task.due_at) {
        const date = new Date(task.due_at)
        let dd = String(date.getDate()).padStart(2, '0');
        let mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = date.getFullYear();
        let hour = String(date.getHours()).padStart(2, '0');
        let min = String(date.getMinutes()).padStart(2, '0');
        return yyyy + '-' + mm + '-' + dd + " " + hour + ":" + min;
    } 
    else if (task.due_on) {
        return task.due_on + " 09:30";
    }
    else {
        return "-";
    }
}

function getAction(task) {
    return task.name.split(" ")[0];
}

function getInfo(task) {
    const idx = task.name.indexOf(" ")
    return task.name[idx+1].toUpperCase() + task.name.slice(task.name.indexOf(" ") + 2);
}

async function parseTasks(response) {
    const tasks = [];
    const users = await getData("https://app.asana.com/api/1.0/teams/"+TEAM_GID+"/users?limit=10");
    for (const task of response.data) {
        if (validTask(task)) {
            console.log(task)
            tasks.push({
                name: getName(task, users),
                due: getDate(task),
                action: getAction(task),
                info: getInfo(task),
            })
        }
    }
    return tasks;
}

function clearTable() {
    const table = document.getElementById("table");
    const body = table.getElementsByTagName("tbody")[0];
    body.innerHTML = "";
}

async function tasksToTable(tasks) {
    const table = document.getElementById("table").getElementsByTagName("tbody")[0];
    let i = 0;
    for (const task of tasks) {
        const row = table.insertRow(i)
        const name = row.insertCell(0);
        const due = row.insertCell(1);
        const action = row.insertCell(2);
        const info = row.insertCell(3);
        name.innerHTML = task.name;
        due.innerHTML = task.due;
        action.innerHTML = task.action;
        info.innerHTML = task.info;
        i++;
    }
}

async function displayTasks() {
    const projectGID = document.getElementById("projects").value;
    let response = await getData("https://app.asana.com/api/1.0/projects/"+projectGID+"/tasks?opt_fields=due_at,assignee,name,due_on,tags&limit=100");
    const tasks = await parseTasks(response)
    clearTable();
    tasksToTable(tasks);
}

populateSelect();
