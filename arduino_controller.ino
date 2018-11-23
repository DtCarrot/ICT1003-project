/* Start of defining configs */
#define DEV_FLAG 0

#include <SPI.h>
#include <STBLE.h>
#include <Wire.h>
#include <TinyScreen.h>

// Default true to draw for the very first time
int needRedraw = 1;


//Debug output adds extra flash and memory requirements!
#ifndef BLE_DEBUG
#define BLE_DEBUG true
#endif

TinyScreen display = TinyScreen(0);

#if defined (ARDUINO_ARCH_AVR)
#define SerialMonitorInterface Serial
#elif defined(ARDUINO_ARCH_SAMD)
#define SerialMonitorInterface SerialUSB
#endif

// Define width and height of screen
#define TinyScreenWidth 96
#define TinyScreenHeight 64

uint8_t ble_rx_buffer[21];
uint8_t ble_rx_buffer_len = 0;
uint8_t ble_connection_state = false;
uint8_t ble_first_connect = true;
uint8_t is_turning = true;
#define PIPE_UART_OVER_BTLE_UART_TX_TX 0

