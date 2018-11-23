
// We need to set up a few things 
// The Serial Monitor Interface if production
void setup() {
  if(DEV_FLAG) initSerialMonitorInterface(); 
  Wire.begin();//initialize I2C before we can initialize TinyScreen- not needed for TinyScreen+
  display.begin();
  display.on();
  display.setFlip(1);
  display.setFont(liberationSansNarrow_12ptFontInfo);   //Set the fornt type
  display.fontColor(TS_8b_Blue,TS_8b_Black);            //Set the font color, font background
  display.setBrightness(10);                  //Set display brightness 0 - 15
  BLEsetup();
}

// For development ONLY - Stop program from running until Serial Monitor has started
// on 57600 bauds
void initSerialMonitorInterface() {
  SerialMonitorInterface.begin(57600);
  while(!SerialMonitorInterface); 
}

String currDir;

void detectButtons() {
  //display.clearScreen();
  // Stop button
  bool isSame = false;
  uint8_t msgToSend = 0;
  uint8_t btn_command[5];
  String forwardCmd,
              forwardLeftCmd,
              forwardRightCmd,
              backCmd, 
              startCmd,
              stopCmd;

  if(!display.getButtons(TSButtonUpperLeft) && !display.getButtons(TSButtonUpperRight)) {
    if(is_turning) {
      is_turning = false;
      startCmd  = "F";
      startCmd.toCharArray(btn_command, 2);
      if(currDir == "straight") {
        isSame= true;
        return false;
      }
      currDir = "straight";
      msgToSend = 1;
      needRedraw = true;
    }
  }
              
  if (display.getButtons(TSButtonUpperLeft)) {
    PRINTF("Left");
    forwardLeftCmd = "FL";
    forwardLeftCmd.toCharArray(btn_command, 3);
    msgToSend = 1;
    if(currDir == "left"){
      isSame= true;
      return false;
    }
    currDir = "left";
    is_turning = true;
    needRedraw = true;
  } 
  // Start button
  else if (display.getButtons(TSButtonUpperRight)) {
     PRINTF("Right");
     forwardRightCmd = "FR";
     forwardRightCmd.toCharArray(btn_command, 3);
     msgToSend = 1;
     if(currDir == "right") {
      isSame= true;
      return false;
     }
     currDir ="right";
     is_turning = true;
     needRedraw = true;
  } 

  else if(display.getButtons(TSButtonLowerRight) && display.getButtons(TSButtonLowerLeft)) {
    stopCmd = "STOP";
    stopCmd.toCharArray(btn_command, 5);
    msgToSend = 1;
    if(currDir == "stop") {
      isSame = true;
      return false;
    }
    currDir = "stop";
    needRedraw = true;
  }
  
  else if(display.getButtons(TSButtonLowerRight)) {
    PRINTF("Forward");
    startCmd  = "F";
    startCmd.toCharArray(btn_command, 2);
    msgToSend = 1;
    if(currDir == "straight") {
      isSame = true;
      return false;
    }
    currDir = "straight";
    needRedraw = true;
  }
  
  
  else if(display.getButtons(TSButtonLowerLeft)) {
    PRINTF("Reverse");
    backCmd = "B";
    backCmd.toCharArray(btn_command, 2);
    msgToSend = 1;
    if(currDir == "back") {
      isSame = true;
      return false;
    }
    currDir = "back";
    needRedraw = true;
  }
  
  
  if(msgToSend && !isSame) {
    //command[strlen(command)] = '\0'; //Terminate string
    if (!lib_aci_send_data(PIPE_UART_OVER_BTLE_UART_TX_TX, (uint8_t*)btn_command, strlen(btn_command)))
    {
      SerialMonitorInterface.println(F("TX dropped!"));
    }  
  }
}

void serial_data_loop() {
  if (ble_rx_buffer_len) {//Check if data is available
    SerialMonitorInterface.print(ble_rx_buffer_len);
    SerialMonitorInterface.print(" : ");
    SerialMonitorInterface.println((char*)ble_rx_buffer);
    ble_rx_buffer_len = 0;//clear afer reading
  }
  if (SerialMonitorInterface.available()) {//Check if serial input is available to send
    delay(10);//should catch input
    uint8_t sendBuffer[21];
    uint8_t sendLength = 0;
    while (SerialMonitorInterface.available() && sendLength < 19) {
      sendBuffer[sendLength] = SerialMonitorInterface.read();
      sendLength++;
    }
    if (SerialMonitorInterface.available()) {
      SerialMonitorInterface.print(F("Input truncated, dropped: "));
      if (SerialMonitorInterface.available()) {
        SerialMonitorInterface.write(SerialMonitorInterface.read());
      }
    }
    sendBuffer[sendLength] = '\0'; //Terminate string
    sendLength++;
    if (!lib_aci_send_data(PIPE_UART_OVER_BTLE_UART_TX_TX, (uint8_t*)sendBuffer, sendLength))
    {
      SerialMonitorInterface.println(F("TX dropped!"));
    }
  }
}

void loop() {
  aci_loop();//Process any ACI commands or events from the NRF8001- main BLE handler, must run often. Keep main loop short.
  serial_data_loop();
  delay(200);
  if(needRedraw) drawConfig();
  detectButtons(); 
}
/*
 * Used to redraw the tinyscreen whenever there are any changes!!!
 * 
 */
void drawConfig() {
  // First, we need to clear the screen
  display.setCursor(15, 25);
  display.clearScreen();
  //display.drawRect(10,10,76,44,TSRectangleFilled,TS_8b_Red);
  char *bleDisplayMsg;
  // Means that there was a disconnection - since we have already connected 
  // via BLE at least once
  PRINTF("Waiting to connect");

  // Get width of BLE display
  int bleDisplayWidth = display.getPrintWidth(bleDisplayMsg); 
  display.fontColor(TS_8b_White,TS_8b_Black); //Set the font color, font background
  //display.print(bleDisplayMsg);
  int colOffset = 5;
  int firstRowOffset= 8;
  int secondRowOffset = 24;
  int thirdRowOffset = 40;
  display.setCursor(colOffset, firstRowOffset);

  if(!ble_connection_state && !ble_first_connect) {
    display.print("BLE");
    display.setCursor(colOffset, secondRowOffset);
    display.print("disconnected");
    //bleDisplayMsg = "BLE disconnected";
  } else if (ble_first_connect && !ble_connection_state) {
    // If user has not connected to BLE yet 
    //bleDisplayMsg = "Awaiting BLE connection";
    display.print("Awaiting BLE");
    display.setCursor(colOffset, secondRowOffset);
    display.print("connection");
  } else {
    // If connected
    display.print("BLE");
    display.setCursor(colOffset, secondRowOffset);
    display.print("connected");
    //bleDisplayMsg = "BLE connected";
  }

  display.setCursor(colOffset, thirdRowOffset);
  display.print("Going " + currDir);

  //display.print("Bluetooth");

  //display.print("not connected");
  PRINTF("Drawing");
  // Do not redraw until the ble state changes
  needRedraw = 0;
  
}


/*
 * Used to send serial input to user
 */
void sendSerialOutput() {
    if (SerialMonitorInterface.available()) {//Check if serial input is available to send
      PRINTF("received data");
      delay(10);//should catch input
      uint8_t sendBuffer[21];
      uint8_t sendLength = 0;
      while (SerialMonitorInterface.available() && sendLength < 19) {
        sendBuffer[sendLength] = SerialMonitorInterface.read();
        sendLength++;
      }
      if (SerialMonitorInterface.available()) {
        SerialMonitorInterface.print(F("Input truncated, dropped: "));
        if (SerialMonitorInterface.available()) {
          SerialMonitorInterface.write(SerialMonitorInterface.read());
        }
      }
      sendBuffer[sendLength] = '\0'; //Terminate string
      sendLength++;
      if (!lib_aci_send_data(PIPE_UART_OVER_BTLE_UART_TX_TX, (uint8_t*)sendBuffer, sendLength))
      {
        SerialMonitorInterface.println(F("TX dropped!"));
      }  
  }
}

