# Einkaufsliste
* [Steppermotor mit Linearschlitten](https://smile.amazon.de/dp/B07H4M3KW2/)
  * Hierran befestigen wir unseren *ToF Sensor*
* [NEMA17-04](https://www.reichelt.de/schrittmotor-nema-17-1-8-1-5-a-3-3-v-nema17-04-p269223.html)
  * Nutzen wir für unseren Drehteller (lieber einen stärkeren Motor nehmen, da wir den Teller auch mit Gewicht bewegen wollen)
* 2x [A4988 Schrittmotor-Treiber-Modul](https://www.az-delivery.de/products/a4988-schrittmotor-modul)
  * Damit können wir die beiden Motoren ansteuern
  * [Das Video könnte hilfreich sein](https://www.youtube.com/watch?v=_5H7ibWQgXo)
* [Steckernetzteil 12V 2A](https://www.reichelt.de/steckernetzteil-24-w-12-v-2-a-hnp-24-120l6-p177030.html)
  * Damit können wir den NEMA17-04 bzw. das Treibermodul mit Strom versorgen
* [Kupplung, Ø außen: 5,5 mm, Ø innen: 2,1 mm (DELOCK 65421)](https://www.reichelt.de/kupplung-aussen-5-5-mm-innen-2-1-mm-delock-65421-p127462.html)
  * Darüber verbinden wir das Netzteil mit dem Treibermodul
  * *Hätte auch einfach abgeschnitten und 2 Steckverbindungen draufgelötet, aber lassen wir das beim Schulprojekt mal lieber*
* [Adafruit VL6180X Time of Flight Micro-LIDAR Distance Sensor](https://www.adafruit.com/product/3316)
  * Damit messen wir die Distanz zum Objekt, dass auf dem Drehteller liegt
* 2x [100µF Capacitor (ca. 70 V)](https://www.reichelt.de/elko-radial-100-uf-63-v-105-c-low-esr-aec-q200-rad-fc-100-63-p84621.html)
  * Kommt zur externen Stromversorgung des Motors (möglichst nah am Driver-Board)
    * Details gibts im [Datasheet](https://cdn.shopify.com/s/files/1/1509/1638/files/A4988_Stepper_Motor_Driver_Datenblatt_AZ-Delivery_Vertriebs_GmbH.pdf?v=1608626085)
  * Weniger als 70 V ist sicherlich auch okay, aber keinesfalls unter 40 V würde ich sagen
