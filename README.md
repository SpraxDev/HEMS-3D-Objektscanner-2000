# 3D-Objektscanner 2000
Im Rahmen eines Lernfeldes in der Berufsschule haben wir ([@Yannik-Roesser](https://github.com/Yannik-Roesser) und [@SpraxDev](https://github.com/SpraxDev)) den 3D-Objektscanner 2000 entwickelt.

Im Grunde besteht dieser aus einem Drehteller, auf dem sich ein Objekt befindet – Ein *ToF Sensor* misst die Distanz zum Objekt-Messpunkt und speichert diesen ab.

Der Drehteller dreht sich, wodurch wir eine 360°-Ansicht des Objekts erhalten; Der *ToF Sensor* kann in der Höhe verstellt werden, wodurch wir nun über das gesamte Objekt hinweg messen können.


## Projektanforderungen
Im Grundlegenden sollten wir folgende Anforderungen erfüllen:
* Verwendung von mindestens vier unterschiedlichen Sensoren oder Aktoren
  * 1x Stepper-Motor (Drehteller)
  * 1x Stepper-Motor mit Linearschlitten (Auf- und Abwärtsbewegung; Für den *ToF Sensor*)
  * 1x ToF Sensor
  * Webinterface (Ein- und Ausgabe; Rendering 3D Modell; Download als STL-Datei)
  * REST-API
* Trennung von Erfassung und Ausgabe der Sensordaten (2 verschiedene Geräte)
  * Erfassung: Python-Script
  * Ausgabe: Webinterface
* Sensorwerte und Eingaben müssen für mindestens 30 Tage gespeichert werden
  * PostgreSQL-Datenbank (Speicherdauer unbegrenzt)
* Fehleingaben des Nutzers müssen entsprechend behandelt werden
  * Validierung der Eingaben
  * Fehlermeldungen (z.B. bei Verbindungsproblemen)
* Klar definiertes Anwendungsgebiet
  * Videospiel-Prototyp günstiger und einfacher herstellen
  * Marketing-Materialien (z.B. für die Produktpräsentation)
  * 3D-Druck (z.B. als Hilfe, wenn ein Objekt als CAD file design werden muss)
  * ...


## Projektstruktur
Das Projekt besteht aus mehrere Software-Komponenten:
* Webinterface-Frontend
* Webinterface-Backend (Webserver + REST-API)
* Python-Script
* FreeCAD
  * Enthält FreeCAD-Projekte, mit Halterungen für die Hardware (zum selber Drucken)
  * Je nach 3D-Druck sind die Maße der Halterungen unter Umständen 1 bis 2 mm zu klein


* Das Frontend muss einmalig gebaut werden und kann deployed werden oder vom Backend ausgeliefert werden.
* Das Backend startet einen HTTP-Server, der die REST-API bereitstellt und optional das Frontend ausliefert.
  * Das Backend kann auch auf einem anderen Server laufen, als das Frontend
* Das Python-Script wird auf dem Raspberry Pi ausgeführt, der die meisten Sensoren und Aktoren steuert
  * Das Python-Script kann auch auf einem anderen Server laufen, als das Backend

Die Daten werden in einer PostgreSQL-Datenbank gespeichert.


## Installation
Frontend und Backend benötigen Node.js (getestet mit Version 18) und npm (wird in der Regel mit Node.js mitgeliefert) als package manager.
Für das Python-Skript wird Python 3 benötigt und `pip` als package manager.

### Webinterface-Frontend
1. Im Frontendordner `npm ci` ausführen, um alle notwendigen Pakete zu installieren
2. `npm run build` ausführen, um das Frontend zu bauen
    * Nach der ersten Ausführung, generiert sich eine `config.json` im `config/`-Ordner,
      die angepasst werden kann
3. Das fertige Frontend findet sich im neuen `dist/`-Ordner – Dieses kann (optional) manuell auf ein anderes System deployed werden

### Webinterface-Backend
1. Im Backendordner `npm ci` ausführen, um alle notwendigen Pakete zu installieren
2. `npm run build` ausführen, um das Backend zu bauen
3. Das fertige Backend findet sich im neuen `dist/`-Ordner – Die (production) Abhängigkeiten in `node_modules/` werden zur Ausführung benötigt
4. Zum Starten `npm run start` ausführen
    * Es generiert sich eine `config.json` im `config/`-Ordner, die angepasst werden muss
    * Wurde das Frontend vorab gebaut und die Projekt-Ordnerstruktur nicht verändert, wird dieses
      automatisch gefunden und ausgeliefert

### Python-Script und Hardware
1. Die Hardware, wie in `Verkabelung.fzz` beschrieben, anschließen
2. Die Hardware mit den GPIO-Pins des Raspberry Pi verbinden
    * *ToF Sensor* an den I2C-Bus anschließen
    * Die Motor-Driver-Boards an die entsprechenden Pins aus `scanner-script/scanner_controller.py` (ca. ab Zeile 109 bei `GPIO_motorTeller` und `GPIO_motorVert`)
3. Im Python-Script-Ordner `pip3 install -r requirements.txt` ausführen, um alle notwendigen Pakete zu installieren
    * Es empfiehlt sich vorab ein virtuelles Python-Environment anzulegen
    * Unter Umständen muss `pip` anstelle von `pip3` verwendet werden
4. Skript bei Bedarf konfigurieren
    * `postgres.py` anpassen, um die Datenbankverbindung zu konfigurieren
4. `python3 scanner_controller.py` ausführen, um das Script zu starten
    * Unter Umständen muss `python` anstelle von `python3` verwendet werden
5. Das Script wartet nun auf einen Startbefehl über die REST-API

### PostgreSQL Datenbank
Die `/database.sql` enthält die Datenbankstruktur und muss einmalig in die Datenbank eingespielt werden.
Es enthält keine OWNER-Informationen, da diese je nach Umgebung variieren können.


## Unsere Einkaufsliste
Dies sind die Teile, die wir im Rahmen der Projekt-Konzeption verwendet haben.
Ein Breadboard und Kabel sind ebenfalls Notwendig – Die 2 Raspberry Pis haben wir ebenfalls nicht aufgelistet, da diese als Teil der Aufgabenstellung bereits vorhanden waren.

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


## Lizenz
Das Projekt ist grundsätzlich unter der MIT-Lizenz veröffentlicht.

Das verwendete Logo im Frontend ist von DinosoftLabs auf Flaticon, lizensiert unter der [Flaticon license](https://www.freepikcompany.com/legal).
