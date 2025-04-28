document.addEventListener("DOMContentLoaded", () => {
    const info = document.getElementById("info");
    const convert = document.getElementById("convert");
    const select = document.getElementById("select");
    
    const simplednsplus = (lines) => {
        const rules = lines.map(line => {
            if (!line.startsWith("E "))
                return null;
            return line.slice(2);
        }).filter(rule => rule !== null);
        return rules;
    }
    
    const dns = (lines) => {
        const rules = lines.map(line => {
            if (!line.startsWith("||"))
                return null;
            return line.slice(2, -1);
        }).filter(rule => rule !== null);
        return rules;
    }
    
    const options = [
        {
            name: "DNS",
            function: dns
        },
        {
            name: "SimpleDNS",
            function: simplednsplus
        }];
    

    for (let index = 0; index < options.length; index++) {
        const _option = options[index];
        const option = document.createElement("option");
        option.innerText = _option.name;
        option.value = index.toString();
        select.appendChild(option);
    }




    document.getElementById("file").addEventListener("change", (e) => {
        info.innerHTML = "";
        info.className = "info";

        const file = e.target.files[0];
        if (file) {
            const fileName = file.name;
            const fileSize = (file.size / 1024).toFixed(2) + " KB";
            info.innerHTML = `Selected file: ${fileName} (${fileSize})`;
            info.className = "success";
            convert.innerHTML = "Convert"
        } else {
            info.innerHTML = "No file selected.";
            info.className = "error";
            convert.innerHTML = "Load file"
        }
        convert.disabled = false;
    });

    convert.addEventListener("click", (e) => {
        info.innerHTML = "";
        info.className = "info";
        // load and read file
        const file = document.getElementById("file").files[0];
        const select = document.getElementById("select");

        if (file) {
            convert.disabled = true;
            convert.innerHTML = "Converting...";
            const reader = new FileReader();
            reader.onload = (event) => {
                const fileContent = event.target.result;
                const lines = fileContent.split("\n");

                const option = select.value;
                const rules = options[option].function(lines);

                if (rules.length <= 0) {
                    info.innerHTML = "Couln't find any rules or domains. <b>Note: check if the entries of the file match the rule selected above.<b/>";
                    info.className = "error";
                    convert.disabled = false;
                    convert.innerHTML = "Convert";
 
                    return;
                }

                let jsRules = '[';
                jsRules += rules.map(url =>
                    `{
                    "id": 1,
                    "priority": 1,
                    "action": { "type": "block" },
                    "condition": {
                        "urlFilter": "${url}",
                        "resourceTypes": ["main_frame"]
                    }
                },`
                ).join("\n");
                jsRules += ']';


                convert.disabled = false;


                const blob = new Blob([jsRules], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "rules.json";
                a.textContent = "Download rules.json";
                a.hidden = true;
                a.style.display = "none";
                a.style.visibility = "hidden";
                document.body.appendChild(a);
                convert.innerHTML = "Download";
                info.innerHTML = "File rules.json is ready to be downloaded. :)"

                convert.onclick = (e) => {
                    e.preventDefault();
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    info.innerHTML = "File rules.json downloaded successfully. :)"
                    convert.disabled = true;
                    convert.innerHTML = "Downloading...";
                    document.getElementById("file").value = "";
                    document.getElementById("file").files = null;
                }
            };
            reader.readAsText(file);
        } else {
            info.className = "error";
            info.innerHTML = "No file selected";
            convert.innerHTML = "Load file";
            document.getElementById("file").click();
            convert.disabled = false;
        }
    });
});
