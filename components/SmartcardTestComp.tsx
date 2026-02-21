import React, { useState, useEffect } from "react";
import {
  Button,
  NativeModules,
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
} from "react-native";
import nativeSmartcard from "@/hooks/nativeSmartcard";
import { NativeEventEmitter } from "react-native";

const { SmartcardModule } = NativeModules;
const emitter = new NativeEventEmitter(SmartcardModule);

const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr.trim() === "") return "-";
  return `${dateStr.substring(6, 8)}/${dateStr.substring(
    4,
    6
  )}/${dateStr.substring(0, 4)}`;
};

const cleanName = (name: string) => {
  if (!name) return "-";
  return name.replace(/#/g, " ").trim();
};

const SmartcardTestComp = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sub = emitter.addListener("SmartcardDebug", (event) => {
      console.log("SMARTCARD DEBUG:", event.message);
    });
    return () => sub.remove();
  }, []);

  const readData = async () => {
    setError(null);
    try {
      const result = await nativeSmartcard.readSmartcardData();
      setData(result);
      console.log(result);
      
    } catch (e: any) {
      setError(e?.message || "Error reading data");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Thai Smartcard Reader</Text>

      <Button title="Read Smartcard" onPress={readData} />

      {error && <Text style={styles.error}>Error: {error}</Text>}

      {/* {data && (
        <View style={styles.card}>
          {data.photoBase64 && (
            <Image
              source={{ uri: `data:image/jpeg;base64,${data.photoBase64}` }}
              style={styles.image}
            />
          )}

          <Text style={styles.label}>เลขบัตรประชาชน</Text>
          <Text style={styles.value}>{data.citizenId}</Text>

          <Text style={styles.label}>ชื่อ - นามสกุล (TH)</Text>
          <Text style={styles.value}>{cleanName(data.nameTH)}</Text>

          <Text style={styles.label}>ชื่อ - นามสกุล (EN)</Text>
          <Text style={styles.value}>{cleanName(data.nameEN)}</Text>

          <Text style={styles.label}>วันเกิด</Text>
          <Text style={styles.value}>{formatDate(data.birthDate)}</Text>

          <Text style={styles.label}>เพศ</Text>
          <Text style={styles.value}>{data.gender}</Text>

          <Text style={styles.label}>ที่อยู่</Text>
          <Text style={styles.value}>
            {cleanName(data.address)}
          </Text>
        </View>
      )} */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f4f6f9",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  card: {
    marginTop: 20,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    elevation: 4,
  },
  image: {
    width: 120,
    height: 150,
    alignSelf: "center",
    marginBottom: 15,
    borderRadius: 10,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "red",
    marginTop: 10,
  },
});

export default SmartcardTestComp;
