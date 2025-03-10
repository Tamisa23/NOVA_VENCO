 // เชื่อมต่อ MQTT Broker ผ่าน WebSockets
const mqttClient = mqtt.connect("wss://2217876f209d4a73af014e541592ee16.s1.eu.hivemq.cloud:8884/mqtt", {
    username: "Venco",
    password: "12345678Venco",
    rejectUnauthorized: false 
});

// เมื่อเชื่อมต่อ MQTT สำเร็จ ให้ Subscribe ไปที่ `DOAR` และ `DOAR/command`
mqttClient.on("connect", function () {
    console.log("✅ MQTT Connected!");
    
    mqttClient.subscribe("DOAR", function (err) {
        if (!err) console.log("✅ Subscribed to DOAR");
    });

    mqttClient.subscribe("DOAR/command", function (err) {
        if (!err) console.log("✅ Subscribed to DOAR/command");
    });
});
let commandData = JSON.parse(localStorage.getItem("commandData")) || {
        START: 0,
        A_M: 0,
        Wheel: 0,
        LTG: 0,
        EMC: 0,
        Mode: 0,
        set_sa: 0,
        set_sa2: 0,
        set_ea: 0,
        SA_SP: 0,
        DPT_SP: 0,
        Aqe: 0,
        smoke: 0
};

    function saveCommandData() {
        localStorage.setItem("commandData", JSON.stringify(commandData));
    }

    window.addEventListener("beforeunload", saveCommandData);

    mqttClient.on("connect", () => {
        mqttClient.subscribe("DOAR");
        mqttClient.subscribe("DOAR/command");
    });
    document.addEventListener("DOMContentLoaded", () => {
        commandData = JSON.parse(localStorage.getItem("commandData")) || commandData;
    
        Object.keys(commandData).forEach(key => updateElement(key, commandData[key]));
    
        // อัปเดต UI ทั้งหมดตามค่าที่เก็บไว้
        updateStartStopUI(commandData.START);
        updateAutoManualUI(commandData.A_M);
        updateWheelUI(commandData.Wheel);
        updateLTGUI(commandData.LTG);
        updateEMCGUI(commandData.EMC);
        updateModeUI(commandData.Mode);
        updateAqeUI(commandData.Aqe);
        updateSmokeUI(commandData.smoke);
    });
    
  function updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
  } 

function updateCommandAndSend(key, value) {
    commandData[key] = value; // อัปเดตค่าใน object
    saveCommandData(); // ✅ บันทึกลง localStorage
    console.log(`🚀 ส่ง MQTT: ${key} = ${value}`, commandData);
    
    // ✅ ส่งค่าทั้งหมดไป MQTT
    mqttClient.publish("DOAR/command", JSON.stringify(commandData));
}


function setSaEaValues(type) {
    let promptText = {
        "set_sa": "กรุณากรอกค่า SET SA:",
        "set_sa2": "กรุณากรอกค่า SET SA2:",
        "set_ea": "กรุณากรอกค่า SET EA:"
    }[type];

    let newValue = prompt(promptText, commandData[type]);

    if (newValue !== null && newValue.trim() !== "" && !isNaN(newValue)) {
        newValue = parseFloat(newValue);
        updateCommandAndSend(type, newValue);
        updateElement(type, newValue);
    } else {
        alert("⚠️ กรุณากรอกตัวเลขที่ถูกต้อง!");
    }
}


function setSaAndDptSp(type) {
    let promptText = {
        "SA_SP": "กรุณากรอกค่า SA SP:",
        "DPT_SP": "กรุณากรอกค่า DPT SP:",
    }[type];

    let newValue = prompt(promptText, commandData[type]);

    if (newValue !== null && newValue.trim() !== "" && !isNaN(newValue)) {
        newValue = parseFloat(newValue);
        updateCommandAndSend(type, newValue);
        updateElement(type, newValue);
    } else {
        alert("⚠️ กรุณากรอกตัวเลขที่ถูกต้อง!");
    }
}


// 📌 ฟังก์ชันเปลี่ยนรูปภาพของปุ่ม START/STOP ตามค่าจาก `cmd`
function updateStartStopUI(value) {
    let startImg = document.getElementById("startImg");
    let stopImg = document.getElementById("stopImg");

    if (startImg && stopImg) {
        console.log("🔄 อัปเดตรูปภาพ UI ตามค่า CMD:", value);
        if (value === 1) {
            startImg.src = "/image/DOAR/icon/N4-19.png"; 
            stopImg.src = "/image/DOAR/P4/BG-STOP.png";
        } else {
            stopImg.src = "/image/DOAR/icon/N4-20.png"; 
            startImg.src = "/image/DOAR/P4/BG-START.png"; 
        }
    } else {
        console.warn("⚠️ ไม่พบ startImg หรือ stopImg ใน DOM");
    }
}

// 📌 ฟังก์ชันเปลี่ยนรูปภาพของปุ่ม Auto/Manual ตามค่าจาก `A_M`
function updateAutoManualUI(value) {
    let autoImg = document.getElementById("autoImg");
    let manualImg = document.getElementById("manualImg");

    if (autoImg && manualImg) {
        console.log("🔄 อัปเดตโหมด AUTO/MANUAL ตามค่า:", value);
        if (value === 1) {
            autoImg.src = "/image/DOAR/icon/N4-23.png"; 
            manualImg.src = "/image/DOAR/icon/BG-MANUAL.png";
        } else {
            manualImg.src = "/image/DOAR/icon/N4-24.png"; 
            autoImg.src = "/image/DOAR/icon/BG-AUTO.png";
        }
    } else {
        console.warn("⚠️ ไม่พบ autoImg หรือ manualImg ใน DOM");
    }
}

// ตัวแปรเก็บสถานะของ Wheel (ค่าเริ่มต้นเป็น 0)
let wheelState = 0;

// 📌 ฟังก์ชันเปลี่ยนรูปภาพของปุ่ม Wheel ตามค่าจาก `Wheel`
function updateWheelUI(value) {
    let wheelImg = document.getElementById("wheelImg");

    if (wheelImg) {
        console.log("🔄 อัปเดตรูปภาพ UI ตามค่า Wheel:", value);
        if (value === 1) {
            wheelImg.src = "/image/DOAR/icon/N4-21.png"; // รูป Wheel เปิด
        } else {
            wheelImg.src = "/image/DOAR/P4/BG-WHEEL p4.png"; // รูป Wheel ปิด
        }
    } else {
        console.warn("⚠️ ไม่พบ wheelImg ใน DOM");
    }
}

function toggleWheel() {
    commandData.Wheel = commandData.Wheel === 0 ? 1 : 0;
    updateCommandAndSend("Wheel", commandData.Wheel);
    updateWheelUI(commandData.Wheel);
}

// 📌 รับค่า Wheel จาก MQTT และอัปเดต UI
mqttClient.on("message", function (topic, message) {
    try {
        var data = JSON.parse(message.toString());
        console.log(`📩 Received MQTT Data from ${topic}:`, data);

        if (topic === "DOAR" && data.Wheel !== undefined && Array.isArray(data.Wheel)) {
            let wheelValue = parseInt(data.Wheel[0], 10);
            console.log("✅ Wheel Value Received:", wheelValue);
            if (!isNaN(wheelValue) && (wheelValue === 0 || wheelValue === 1)) {
                wheelState = wheelValue; // อัปเดตสถานะในตัวแปร
                updateWheelUI(wheelValue);
            }
        }

    } catch (error) {
        console.error("❌ Error parsing MQTT message:", error);
    }
});


function toggleStartStop(action) {
    let newValue = (action === "start") ? 1 : 0;
    updateCommandAndSend("START", newValue);
    updateStartStopUI(newValue);
}
function toggleAutoManual(action) {
    let newValue = (action === "Auto") ? 1 : 0;
    updateCommandAndSend("A_M", newValue);
    updateAutoManualUI(newValue);
}
// ✅ ฟังก์ชันสลับค่าและส่งไป MQTT
function toggleAQE() {
    commandData.Aqe = commandData.Aqe === 0 ? 1 : 0;
      updateCommandAndSend("Aqe", commandData.Aqe);
      updateAqeUI(commandData.Aqe);
}
function toggleSmoke() {
    commandData.Smoke = commandData.Smoke === 0 ? 1 : 0;
      updateCommandAndSend("Smoke", commandData.Smoke);
      updateSmokeUI(commandData.Smoke);
}
// ✅ อัปเดต UI ตามค่า
function updateAqeUI(value) {
    document.getElementById("AqeImg").src = value === 1 ? "/image/DOAR/icon/AQE-ON.png" : "/image/DOAR/icon/ar.png";
}

function updateSmokeUI(value) {
    document.getElementById("SmokeImg").src = value === 1 ? "/image/DOAR/icon/N4-18.png" : "/image/DOAR/icon/smoke.png";
}


// 📌 ฟังก์ชันอัปเดตค่าใน HTML
function updateElement(id, value) {
    let element = document.getElementById(id);
    if (element && value !== undefined) {
        element.innerText = parseFloat(value); 
    }
}

// ✅ อัปเดต Filter ตามค่า
function updateFilter(value) {
    let imgFilterOn = document.getElementById("Filter_On");
    let imgFilterOff = document.getElementById("Filter_Off");

    if (!imgFilterOn || !imgFilterOff) {
        console.warn("⚠️ ไม่พบองค์ประกอบรูปภาพ Filter ใน DOM");
        return;
    }

    imgFilterOn.style.display = "none";
    imgFilterOff.style.display = "none";

    if (value === 1) {
        imgFilterOn.style.display = "block";  // ✅ เปิด Filter
    } else {
        imgFilterOff.style.display = "block"; // ✅ ปิด Filter
    }
}

// ตรวจสอบว่า DOM โหลดเสร็จ
document.addEventListener("DOMContentLoaded", function() {
    console.log("📌 DOM Loaded, Ready to receive MQTT messages.");
});

// จัดการข้อผิดพลาดของ MQTT
mqttClient.on("error", function (error) {
    console.error("❌ MQTT Error:", error);
});

mqttClient.on("close", function () {
    console.warn("⚠️ MQTT Disconnected! Reconnecting...");
});

// 📌 ฟังก์ชันเปลี่ยนรูปภาพของปุ่ม LTG ตามค่าจาก `LTG`
function updateLTGUI(value) {
    let LTGImg = document.getElementById("LTGImg"); // ใช้ LTGImg แทน wheelImg

    if (LTGImg) {
        console.log("🔄 อัปเดตรูปภาพ UI ตามค่า LTG:", value);
        if (value === 1) {
            LTGImg.src = "/image/DOAR/icon/N4-22.png"; // รูป LTG เปิด
        } else {
            LTGImg.src = "/image/DOAR/P4/BG-LIGHTING.png"; // รูป LTG ปิด
        }
    } else {
        console.warn("⚠️ ไม่พบ LTGImg ใน DOM");
    }
}
// ตัวแปรเก็บสถานะของ LTG (ค่าเริ่มต้นเป็น 0)
let LTGState = 0;

function toggleLTG() {
    commandData.LTG = commandData.LTG === 0 ? 1 : 0;
    updateCommandAndSend("LTG", commandData.LTG);
    updateLTGUI(commandData.LTG);
}


// 📌 รับค่า LTG จาก MQTT และอัปเดต UI
mqttClient.on("message", function (topic, message) {
    try {
        var data = JSON.parse(message.toString());
        console.log(`📩 Received MQTT Data from ${topic}:`, data);

        if (topic === "DOAR" && data.LTG !== undefined && Array.isArray(data.LTG)) {
            let LTGValue = parseInt(data.LTG[0], 10);
            console.log("✅ LTG Value Received:", LTGValue);
            if (!isNaN(LTGValue) && (LTGValue === 0 || LTGValue === 1)) {
                LTGState = LTGValue; // อัปเดตสถานะในตัวแปร
                updateLTGUI(LTGValue);
            }
        }

    } catch (error) {
        console.error("❌ Error parsing MQTT message:", error);
    }
});


// 📌 ฟังก์ชันเปลี่ยนรูปภาพของปุ่ม EMC ตามค่าจาก `EMC`
function updateEMCGUI(value) {
    let EMCImg = document.getElementById("EMCImg"); // ใช้ EMCImg แทน LTGImg

    if (EMCImg) {
        console.log("🔄 อัปเดตรูปภาพ UI ตามค่า EMC:", value);
        if (value === 1) {
            EMCImg.src = "/image/DOAR/icon/EMC.png"; // รูป EMC เปิด
        } else {
            EMCImg.src = "/image/DOAR/P2/BG-EMC.png"; // รูป EMC ปิด
        }
    } else {
        console.warn("⚠️ ไม่พบ EMCImg ใน DOM");
    }
}

function toggleEMC() {
    commandData.EMC = commandData.EMC === 0 ? 1 : 0;
    updateCommandAndSend("EMC", commandData.EMC);
    updateEMCGUI(commandData.EMC);
}


// 📌 รับค่า EMC จาก MQTT และอัปเดต UI
mqttClient.on("message", function (topic, message) {
    try {
        var data = JSON.parse(message.toString());
        console.log(`📩 Received MQTT Data from ${topic}:`, data);

        if (topic === "DOAR" && data.EMC !== undefined) {
            let EMCValue = parseInt(data.EMC, 10);
            console.log("✅ EMC Value Received:", EMCValue);
            if (!isNaN(EMCValue) && (EMCValue === 0 || EMCValue === 1)) {
                EMCState = EMCValue; // อัปเดตสถานะในตัวแปร
                updateEMCGUI(EMCValue);
            }
        }

    } catch (error) {
        console.error("❌ Error parsing MQTT message:", error);
    }
});


function updateModeUI(value) {
    let modeImg1 = document.getElementById("modeImg1");
    let modeImg2 = document.getElementById("modeImg2");
    let modeImg3 = document.getElementById("modeImg3");
    let modeImg4 = document.getElementById("modeImg4");

    console.log("🔄 อัปเดต Mode UI ตามค่า:", value);

    // ตั้งค่าเริ่มต้นให้รูปภาพทั้งหมดเป็นปิดก่อน
    modeImg1.src = "/image/DOAR/icon/BG-NORMAL.png";
    modeImg2.src = "/image/DOAR/icon/BG-FRESH AIR.png";
    modeImg3.src = "/image/DOAR/icon/BG-EXHAUST.png";
    modeImg4.src = "/image/DOAR/icon/BG-Test Smoke-31.png";

    // เปลี่ยนรูปของ Mode ที่ถูกเลือกให้เป็น "เปิด"
    if (value === 1) {
        modeImg1.src = "/image/DOAR/icon/N4-15.png"; // รูป Normal On
    } else if (value === 2) {
        modeImg2.src = "/image/DOAR/icon/N4-16.png"; // รูป Exhaust On
    } else if (value === 3) {
        modeImg3.src = "/image/DOAR/icon/N4-17.png"; // รูป Fresh Air On
    } else if (value === 4) {
        modeImg4.src = "/image/DOAR/icon/N4-18.png"; // รูป Test On
    }
    
}
function setMode(mode) {
    updateCommandAndSend("Mode", mode);
    updateModeUI(mode);
}

mqttClient.on("message", function (topic, message) {
    try {
        var data = JSON.parse(message.toString());
        console.log(`📩 Received MQTT Data from ${topic}:`, data);

        if (topic === "DOAR/command") {
            Object.keys(data).forEach(key => {
               // ตรวจสอบไม่ให้เขียนทับค่าใน localStorage ด้วย 0
               if (data[key] !== undefined && data[key] !== null && data[key] !== 0) {
                commandData[key] = data[key];
                updateElement(key, data[key]);
            }
            });

            saveCommandData(); // ✅ บันทึกค่าใหม่ลง localStorage

            // ✅ อัปเดต UI ตามค่าล่าสุด
            updateElement("SA_SP", commandData.SA_SP);
            updateElement("DPT_SP", commandData.DPT_SP);
            updateElement("set_sa", commandData.set_sa);
            updateElement("set_sa2", commandData.set_sa2);
            updateElement("set_ea", commandData.set_ea);
            updateStartStopUI(commandData.START);
            updateAutoManualUI(commandData.A_M);
            updateWheelUI(commandData.Wheel);
            updateLTGUI(commandData.LTG);
            updateEMCGUI(commandData.EMC);
            updateModeUI(commandData.Mode);
            updateAqeUI(commandData.Aqe);
            updateSmokeUI(commandData.Smoke);
        }
    } catch (error) {
        console.error("❌ Error parsing MQTT message:", error);
    }
});

// ✅ รับค่าจาก MQTT และอัปเดต UI
mqttClient.on("message", function (topic, message) {
    try {
        let data = JSON.parse(message.toString());
        console.log(`📩 MQTT Data Received from ${topic}:`, data);

        if (topic === "DOAR") {
            if (data.Smoke !== undefined) {
                localStorage.setItem("Smoke", data.Smoke);
                updateSmokeUI(parseInt(data.Smoke, 10));
            }
            if (data.Aqe !== undefined) {
                localStorage.setItem("Aqe", data.Aqe);
                updateAqeUI(parseInt(data.Aqe, 10));
            }
            if (data.EMC !== undefined) {
                localStorage.setItem("EMC", data.EMC);
                updateEMCGUI(parseInt(data.EMC, 10));
            }
            if (data.Filter !== undefined) {
                localStorage.setItem("Filter", data.Filter);
                updateFilter(parseInt(data.Filter, 10));
            }
            if (data.PM10 !== undefined) updateElement("PM10", data.PM10);
            if (data.PM25 !== undefined) updateElement("PM25", data.PM25);
            if (data.AQI_AC !== undefined) updateElement("AQI_AC", data.AQI_AC);
}
    } catch (error) {
        console.error("❌ Error parsing MQTT message:", error);
    }
    });


mqttClient.on("message", function (topic, message) {
    try {
        var data = JSON.parse(message.toString());
        console.log(`📩 Received MQTT Data from ${topic}:`, data);

        if (topic === "DOAR" && data.mode !== undefined && Array.isArray(data.mode)) {
            let modeValue = parseInt(data.mode[0], 10);
            console.log("✅ Mode Value Received:", modeValue);
            if (!isNaN(modeValue) && modeValue >= 1 && modeValue <= 4) {
                updateModeUI(modeValue);
            }
        }
    } catch (error) {
        console.error("❌ Error parsing MQTT message:", error);
    }
});
