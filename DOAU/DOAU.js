// เชื่อมต่อ MQTT Broker ผ่าน WebSockets
const mqttClient = mqtt.connect("wss://2217876f209d4a73af014e541592ee16.s1.eu.hivemq.cloud:8884/mqtt", {
    username: "Venco",
    password: "12345678Venco",
    rejectUnauthorized: false
});

// เมื่อเชื่อมต่อสำเร็จ
mqttClient.on("connect", function () {
    console.log("✅ MQTT Connected!");
    mqttClient.subscribe("/edge/DOAU/+/rtg", function (err) {
        if (!err) {
            console.log("✅ Subscribed to RTG topic");
        }
    });
});

// ฟังก์ชันอัปเดต DOM
function updateElement(id, value) {
    let element = document.getElementById(id);
    if (element && value !== undefined) {
        element.innerText = parseFloat(value).toFixed(2);
    } else {
        console.warn(`⚠️ Element with ID '${id}' not found or value undefined`);
    }
}

// ฟังก์ชันอัปเดตค่า Integer
function updateIntegerElement(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.innerText = parseInt(value, 10);
    }
}

// ฟังก์ชันอัปเดตสถานะ RUN/OFF
function updateStatusElement(id, value) {
    const el = document.getElementById(id);
    if (el) {
        const numericVal = parseFloat(value);
        el.textContent = numericValue > 10 ? "RUN" : "OFF";
    } else {
        console.warn(`⚠️ ไม่พบ ${id} ใน DOM`);
    }
}

// ฟังก์ชันอัปเดต GIF พัดลม
function updateFanGif(id, value) {
    const gif = document.getElementById(id);
    if (gif) {
        gif.style.display = parseFloat(value) > 10 ? "block" : "none";
    }
}

// เมื่อได้รับข้อมูลจาก MQTT
mqttClient.on("message", (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        console.log("📩 Received MQTT Data:", data);

        if (data.devs && Array.isArray(data.devs)) {
            data.devs.forEach(dev => {
                if (dev.d && Array.isArray(dev.d)) {
                    dev.d.forEach(item => {
                        if (item.m && item.v !== undefined) {
                            updateElement(item.m, item.v);  // ใช้ item.m เป็น id และ item.v เป็นค่า
                        }
                    });
                }
            });
        }

        // ✅ ตัวอย่างข้อมูลที่คุณส่งมา ใช้เคสนี้หลักๆ:
        if (data.de && Array.isArray(data.de)) {
            data.de.forEach(item => {
                updateElement(item.m, item.value || item.v);
            });
        }

        // ข้อมูลล่าสุดที่มี `d` และ `m`
        if (data.dev && Array.isArray(data.dev)) {
            data.dev.forEach(device => {
                device.d.forEach(dItem => {
                    updateElement(d.m, d.v);
                });
            });
        }

        // ตัวอย่างสำหรับข้อมูลที่มีการส่งเข้ามา
        if (data.ra_h !== undefined) updateElement("ra_h", data.ra_h);
        if (data.sa_t !== undefined) updateElement("sa_t", data.sa_t);
        if (data.SA_Temp !== undefined) updateElement("SA_Temp", data.SA_Temp);
        if (data.SA_Hum !== undefined) updateElement("SA_Hum", data.SA_Hum);
        if (data.OA_Temp !== undefined) updateElement("OA_Temp", data.OA_Temp);
        if (data.DXVALVE !== undefined) updateElement("DXVALVE", data.DXVALVE);

        // อัปเดต GIF Wheel
        if (data.Wheel !== undefined) {
            updateWheel(data.Wheel);
        }

        // อัปเดต EMC UI
        if (data.EMC !== undefined) {
            updateEMCGUI(data.EMC);
        }

    } catch (error) {
        console.error("❌ Error parsing MQTT data:", error);
    }
});


// MQTT Error Handling
mqttClient.on("error", (error) => {
    console.error("❌ MQTT Error:", error);
});

mqttClient.on("close", function () {
    console.warn("⚠️ MQTT Disconnected! Reconnecting...");
});

