if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").then(function(reg) {
        console.log("registered service worker in scope: ", reg.scope);
    }).catch(function(err) {
        console.log("failed to register service worker: ", err);
    });
}

let contents = document.getElementById("contents");

function ceiling(n) { return Math.ceil(n * 2) / 2 }
function twos(n) { return Math.floor(n / 2) * 2 }
function get_ratio(f, s) { return s / f }
function get_correction(n, s) {
    if (n > 9) {
        let r = Math.round(n);
        return s * (twos(r - 9) / 2) + s;
    } else {
        return 0;
    }
}

class Food {
    constructor(name, carbs) {
        this.name = name;
        this.carbs = carbs;
    }

    rough_units(ratio) {
        return this.carbs / ratio;
    }

    element(ratio, index, p_index) {
        let row = document.createElement("tr");
        let name = document.createElement("td");
        let carbs = document.createElement("td");
        let units = document.createElement("td");
        let delete_column = document.createElement("td");

        name.innerHTML = this.name;
        carbs.innerHTML = String(this.carbs) + "g";
        units.innerHTML = String(this.rough_units(ratio).toFixed(1));

        let delete_food = document.createElement("button");
        delete_food.classList.add("delete_food");
        delete_food.id = "df" + String(p_index) + "_" + String(index);

        delete_column.classList.add("delete_column");
        delete_food.innerHTML = "X";
        delete_column.appendChild(delete_food);

        row.appendChild(name);
        row.appendChild(carbs);
        row.appendChild(units);
        row.appendChild(delete_column);

        return row;
    }
}

class Meal {
    constructor(level, food) {
        this.time = new Date().toLocaleTimeString();
        this.level = level;
        this.food = food;
    }

    copy(meal) {
        this.time = meal.time;
        this.level = meal.level;
        this.food = [];

        for (let food of meal.food) {
            this.food.push(new Food(food.name, food.carbs));
        }
    }

    get total_carbs() {
        return this.food
            .map((food) => food.carbs)
            .reduce((acc, x) => acc + x);
    }

    correction(scale) {
        return get_correction(this.level, scale);
    }

    units(ratio, scale) {
        return ceiling(this.total_carbs / ratio + this.correction(scale));
    }

    add_food(food) {
        this.food.push(food);
    }

    element(ratio, scale, index) {
        let meal = document.createElement("meal");

        let delete_meal = document.createElement("button");
        delete_meal.classList.add("delete_meal");
        delete_meal.id = "dm" + String(index);

        delete_meal.innerHTML = "X";

        let time = document.createElement("span");
        let level = document.createElement("span");

        let spacer = 
        time.innerHTML = this.time + "<br />";
        level.innerHTML = "Blood Sugar Level: " + String(this.level);

        meal.appendChild(delete_meal);
        meal.appendChild(time);
        meal.appendChild(level);

        let table = document.createElement("table");
        let header_row = document.createElement("tr");

        let name_header = document.createElement("th");
        let carbs_header = document.createElement("th");
        let units_header = document.createElement("th");

        name_header.innerHTML = "Name";
        carbs_header.innerHTML = "Carbs";
        units_header.innerHTML = "Units";

        header_row.appendChild(name_header);
        header_row.appendChild(carbs_header);
        header_row.appendChild(units_header);

        table.appendChild(header_row);

        if (this.food.length > 0) {
            for (let i in this.food) {
                table.appendChild(this.food[i].element(ratio, i, index));
            }

            let empty_row = document.createElement("tr");
            empty_row.appendChild(document.createElement("td"));
            empty_row.appendChild(document.createElement("td"));
            empty_row.appendChild(document.createElement("td"));
        
            table.appendChild(empty_row);
        }

        let correction_row = document.createElement("tr");
        let correction_name = document.createElement("td");
        let correction_units = document.createElement("td");

        correction_name.innerHTML = "Correction";
        correction_units.innerHTML = String(this.correction(scale));

        correction_row.appendChild(correction_name);
        correction_row.appendChild(document.createElement("td"));
        correction_row.appendChild(correction_units);

        let total_row = document.createElement("tr");
        let total_name = document.createElement("td");
        let total_carbs = document.createElement("td");
        let total_units = document.createElement("td");

        total_name.innerHTML = "Total";

        if (this.food.length > 0) {
            total_carbs.innerHTML = String(this.total_carbs) + "g";
            total_units.innerHTML = String(this.units(ratio, scale));
        } else {
            total_carbs.innerHTML = "0g";
            total_units.innerHTML = String(this.correction(scale));
        }

        total_row.appendChild(total_name);
        total_row.appendChild(total_carbs);
        total_row.appendChild(total_units);

        table.appendChild(correction_row);
        table.appendChild(total_row);

        meal.appendChild(table);

        return meal;
    }
}

class History {
    constructor() {
        let ratio_f = document.getElementById("ratio_f");
        let ratio_s = document.getElementById("ratio_s");
        let scale = document.getElementById("scale");1

        let raw = localStorage.getItem("history");
        if (raw != null && raw != "") {
            let old = JSON.parse(raw);
            
            this.ratio_f = old.ratio_f;
            this.ratio_s = old.ratio_s;

            this.scale = old.scale;

            ratio_f.value = old.ratio_f;
            ratio_s.value = old.ratio_s;

            scale.value = old.scale;

            this.meals = [];
            for (let meal of old.meals) {
                let m = new Meal();
                m.copy(meal)
                this.meals.push(m);
            }
        } else {
            this.ratio_f = Number(ratio_f.value);
            this.ratio_s = Number(ratio_s.value);

            this.scale = Number(scale.value);

            this.meals = [];
        }
    }

    save() {
        localStorage.setItem("history", JSON.stringify(this));
    }

    add_meal(meal) {
        this.meals.push(meal);
    }

    render() {
        let ratio = get_ratio(this.ratio_f, this.ratio_s);

        while (contents.firstChild) {
            contents.removeChild(contents.firstChild);
        }

        for (let i in this.meals) {
            contents.appendChild(this.meals[i].element(ratio, this.scale, i));
            contents.appendChild(document.createElement("hr"));
        }
        if (contents.lastChild) {
            contents.removeChild(contents.lastChild);
        }
    }
}

window.onload = function() {
    let history = new History();
    history.render();
    
    window.onunload = function() {
        history.save();
    };

    window.onbeforeunload = function() {
        history.save();
    };

    let add_food_item = document.getElementById("add_food_item");
    let new_meal = document.getElementById("new_meal");
    
    let register_delete_food = function() {
        let buttons = document.getElementsByClassName("delete_food");
        for (let button of buttons) {
            button.onclick = function() {
                let indexes = button.id.substring(2).split("_");
                history.meals[Number(indexes[0])].food
                    .splice(Number(indexes[1]), 1);
                history.save();
                history.render();
                register_delete_meals();
                register_delete_food();
            };
        }
    };

    let register_delete_meals = function() {
        let buttons = document.getElementsByClassName("delete_meal");
        for (let button of buttons) {
            button.onclick = function() {
                if (confirm("Are you sure you want to delete this meal?")) {
                    history.meals.splice(Number(button.id.substring(2)), 1);
                    history.save();
                    history.render();
                    register_delete_meals();
                    register_delete_food();
                }
            };
        }
    };
    register_delete_meals();
    register_delete_food();

    add_food_item.onclick = function() {
        let name = document.getElementById("name").value;
        let carbs = Number(document.getElementById("carbs").value);
        
        if (history.meals.length > 0) {
            if (name != "") {
                history.meals[history.meals.length - 1]
                    .add_food(new Food(name, carbs));
                history.save();
                history.render();
                register_delete_meals();
                register_delete_food();
            } else {
                alert("Food item must have name!");
            }
        } else {
            alert("No meals to add item to!");
        }
    };

    new_meal.onclick = function() {
        let level = Number(document.getElementById("level").value);
        history.add_meal(new Meal(level, []));
        history.save();
        history.render();
        register_delete_meals();
        register_delete_food();
    };

    let ratio_f = document.getElementById("ratio_f");
    let ratio_s = document.getElementById("ratio_s");
    let scale = document.getElementById("scale");

    ratio_f.oninput = function() {
        history.ratio_f = Number(ratio_f.value);
        history.render();
    };

    ratio_s.oninput = function() {
        history.ratio_s = Number(ratio_s.value);
        history.render();
    };

    scale.oninput = function() {
        history.scale = Number(scale.value);
        history.render();
    };

    let export_button = document.getElementById("export");
    let import_button = document.getElementById("import");

    export_button.onclick = function() {
        let output = document.getElementById("output");
        output.value = JSON.stringify(history);
    };

    import_button.onclick = function() {
        if (confirm("Are you sure you want to load this data?")) {
            let input = document.getElementById("input").value;
            localStorage.setItem("history", input);
            history = new History();
            history.render();
        }
    };
}
