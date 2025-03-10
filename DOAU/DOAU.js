
  // เชื่อมต่อ MQTT Broker ผ่าน WebSockets
  const mqttClient = mqtt.connect("wss://2217876f209d4a73af014e541592ee16.s1.eu.hivemq.cloud:8884/mqtt", {
      username: "Venco",
      password: "12345678Venco",
      rejectUnauthorized: false // ปิดการตรวจสอบ SSL Certificate (ถ้าจำเป็น)
  });

  // เมื่อเชื่อมต่อสำเร็จ
  mqttClient.on("connect", function () {
      console.log("✅ MQTT Connected!");
      mqttClient.subscribe("DOAU", function (err) {
          if (!err) {
              console.log("✅ Subscribed to DOAU");
          }
      });
  });

  // ฟังก์ชันอัปเดตค่าใน HTML
  function updateElement(id, value) {
      let element = document.getElementById(id);
      if (element && value !== undefined) {
          element.innerText = parseFloat(value).toFixed(2); // แปลงเป็นทศนิยม 2 ตำแหน่ง
      }
  }


 // ✅ ฟังก์ชันอัปเดตค่าความเร็วพัดลม (ใช้กับ *_ac)
 function updateIntegerElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        let numericValue = parseFloat(value);
        element.textContent = !isNaN(numericValue) ? Math.round(numericValue) : "N/A"; // ปัดเศษเป็นจำนวนเต็ม
    }
}

    // ✅ ฟังก์ชันอัปเดตสถานะ RUN / OFF (ใช้กับ *_st)
    function updateStatusElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            let numericValue = parseFloat(value);
            console.log(`Updating status for ${id}: ${numericValue}, Type: ${typeof numericValue}`);
            if (!isNaN(numericValue)) {
                element.textContent = numericValue > 10 ? "RUN" : "OFF";
                console.log(`✅ Updated ${id} to: ${element.textContent}`);
            } else {
                element.textContent = "N/A";
                console.log(`❌ Invalid value for ${id}, setting to N/A`);
            }
        } else {
            console.error(`❌ Element with ID '${id}' not found.`);
        }
    }

// ✅ ฟังก์ชันอัปเดต GIF (ถ้ามีการเคลื่อนที่)
function updateFanGIF(id, value) {
    let fanGif = document.getElementById(id);
    if (!fanGif) return;

    let numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue > 10) {
        fanGif.style.display = "block";  
    } else {
        fanGif.style.display = "none";
    }
}


   // ฟังก์ชันอัปเดต UV
   function updateUV(UV) {
    let imgUV_On = document.getElementById("UV_On");
    let imgUV_Off = document.getElementById("UV_Off");

    if (!imgUV_On || !imgUV_Off) return;

    // ซ่อนทุกภาพก่อน
    imgUV_On.style.display = "none";
    imgUV_Off.style.display = "none";

    if (parseInt(UV) === 1) {
  imgUV_On.style.display = "block";  
} else {
  imgUV_Off.style.display = "block";
}
 }

// ✅ รับค่าจาก MQTT และอัปเดตข้อมูล
mqttClient.on("message", function (topic, message) {
    try {
        var data = JSON.parse(message.toString());
        console.log("📩 Received MQTT Data:", data);

            // ✅ Debugging log เช็คค่าที่ได้รับ
            console.log("SA AC:", data.Speed, "EBM AC:", data.AC_Speed );

            // ✅ อัปเดตค่าความเร็วของพัดลม
            if (data.sa1_ac !== undefined) {
                console.log(`Updating SA: ${data.sa_ac} (Type: ${typeof data.sa1_ac})`);
                updateIntegerElement("sa_ac", data.sa_ac);  
                updateStatusElement("sa_st", data.sa_ac);
            }

            if (data.ebm_ac !== undefined) {
                console.log(`Updating EBM: ${data.ebm_ac} (Type: ${typeof data.ebm_ac})`);
                updateIntegerElement("ebm_ac", data.ebm_ac);  
                updateStatusElement("ebm_st", data.ebm_ac);
            }

      

        // ✅ อัปเดต GIF ของพัดลม
        if (data.AC_Speed !== undefined) updateFanGIF("ebm_gif", data.AC_Speed);
        if (data.Speed !== undefined) updateFanGIF("sa_gif", data.Speed);
        

        // ✅ อัปเดตค่าเซ็นเซอร์และระบบอื่น ๆ
        if (data.SA_Temp !== undefined) updateElement("SA_Temp", data.SA_Temp);
        if (data.SA_Hum !== undefined) updateElement("SA_Hum", data.SA_Hum);
        if (data.OA_Temp !== undefined) updateElement("OA_Temp", data.OA_Temp);
        if (data.OA_Hum !== undefined) updateElement("OA_Hum", data.OA_Hum);
        if (data.Lev_Coil_Temp !== undefined) updateElement("oa_lev_t", data.oa_lev_t);
        if (data.DXVALVE !== undefined) updateElement("DXVALVE", data.DXVALVE);

    } catch (error) {
        console.error("❌ Error parsing MQTT message:", error);
    }
});


  // ตรวจสอบว่าหน้าเว็บโหลดเสร็จแล้ว
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



