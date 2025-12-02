/// <reference lib="dom" />
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type USBEndpoint = {
    endpointNumber: number;
    direction: "in" | "out";
    type: "bulk" | "interrupt" | "isochronous";
};

type USBAlternate = {
    interfaceClass: number;
    endpoints?: USBEndpoint[];
};

type USBInterface = {
    interfaceNumber: number;
    alternates: USBAlternate[];
};

type USBConfiguration = {
    configurationValue: number;
    interfaces: USBInterface[];
};

type USBDevice = {
    vendorId?: number;
    productId?: number;
    serialNumber?: string;
    productName?: string;
    manufacturerName?: string;
    opened?: boolean;
    configuration?: USBConfiguration;
    configurations?: USBConfiguration[];
    open: () => Promise<void>;
    selectConfiguration: (value: number) => Promise<void>;
    claimInterface: (iface: number) => Promise<void>;
    releaseInterface: (iface: number) => Promise<void>;
    close: () => Promise<void>;
    transferOut: (endpoint: number, data: Uint8Array) => Promise<{ status: string }>;
    transferIn: (endpoint: number, length: number) => Promise<USBInTransferResult>;
};

type USBDeviceFilter = {
    vendorId?: number;
    productId?: number;
    classCode?: number;
    subclassCode?: number;
    protocolCode?: number;
};

type USBInTransferResult = {
    status: string;
    data?: DataView;
};

type USB = {
    requestDevice: (options: { filters?: USBDeviceFilter[] }) => Promise<USBDevice>;
    getDevices: () => Promise<USBDevice[]>;
    addEventListener: (event: "connect" | "disconnect", listener: EventListener) => void;
    removeEventListener: (event: "connect" | "disconnect", listener: EventListener) => void;
};

type HIDDeviceCollection = {
    usagePage?: number;
};

type HIDDevice = {
    vendorId?: number;
    productId?: number;
    productName?: string;
    collections?: HIDDeviceCollection[];
};

type HIDDeviceFilter = {
    vendorId?: number;
    productId?: number;
    usagePage?: number;
    usage?: number;
};

type HID = {
    getDevices: () => Promise<HIDDevice[]>;
    requestDevice: (options: { filters?: HIDDeviceFilter[] }) => Promise<HIDDevice[]>;
    addEventListener: (event: "connect" | "disconnect", listener: EventListener) => void;
    removeEventListener: (event: "connect" | "disconnect", listener: EventListener) => void;
};

type ReaderDevice = {
    id: string;
    label: string;
    kind: "USB" | "HID";
    info: string;
};

type CardInfo = {
    idNumber: string;
    fullName: string;
    fullNameEn: string;
    sex: string;
    birthDate: string;
    age: string;
    issueDate: string;
    expiryDate: string;
    address: string;
    cardStatus: string;
    statusCode: string;
    readerName: string;
};

const SMART_CARD_FILTERS: USBDeviceFilter[] = [
    { vendorId: 0x058f, productId: 0x9540 }, // Alcorlink USB Smart Card Reader
    { classCode: 0x0b },                     // เผื่อ generic CCID ตัวอื่นในอนาคต
];

const HID_SMART_CARD_FILTERS: HIDDeviceFilter[] = [{ usagePage: 0x0b }];

const toHex = (value?: number) =>
    value != null ? `0x${value.toString(16).padStart(4, "0").toUpperCase()}` : "n/a";

const mapUsbDevice = (device: USBDevice): ReaderDevice => ({
    id: `${device.vendorId ?? 0}-${device.productId ?? 0}-${device.serialNumber ?? "0"}`,
    label: device.productName ?? "เครื่องอ่าน USB",
    kind: "USB",
    info: `VID ${toHex(device.vendorId)} · PID ${toHex(device.productId)}${device.manufacturerName ? ` · ${device.manufacturerName}` : ""
        }`,
});

const mapHidDevice = (device: HIDDevice): ReaderDevice => {
    const usagePage = device.collections?.[0]?.usagePage;
    return {
        id: `${device.vendorId ?? 0}-${device.productId ?? 0}-${usagePage ?? 0}-${device.productName ?? "HID"}`,
        label: device.productName ?? "HID เครื่องอ่าน",
        kind: "HID",
        info: `VID ${toHex(device.vendorId)} · PID ${toHex(device.productId)}${usagePage ? ` · usage ${usagePage}` : ""
            }`,
    };
};

const hexToBytes = (value: string) => {
    const cleaned = value.replace(/[^0-9a-f]/gi, "");
    if (!cleaned) return new Uint8Array();
    if (cleaned.length % 2) {
        throw new Error("ค่าที่ได้รับต้องมีจำนวนคู่ของตัวอักษร HEX");
    }
    const bytes = new Uint8Array(cleaned.length / 2);
    for (let i = 0; i < cleaned.length; i += 2) {
        bytes[i / 2] = parseInt(cleaned.slice(i, i + 2), 16);
    }
    return bytes;
};

const bytesToHex = (data: Uint8Array) =>
    Array.from(data).map((byte) => byte.toString(16).padStart(2, "0")).join(" ");

const buildPowerOnBlock = (sequence: number) => {
    const buffer = new Uint8Array(10);
    buffer[0] = 0x62; // PC_to_RDR_IccPowerOn
    buffer[6] = sequence & 0xff;
    return buffer;
};

const buildXfrBlock = (sequence: number, payload: Uint8Array) => {
    const buffer = new Uint8Array(10 + payload.length);
    buffer[0] = 0x6f; // PC_to_RDR_XfrBlock
    let offset = 2;
    buffer[offset++] = payload.length & 0xff;
    buffer[offset++] = (payload.length >> 8) & 0xff;
    buffer[offset++] = (payload.length >> 16) & 0xff;
    buffer[offset++] = (payload.length >> 24) & 0xff;
    buffer[6] = sequence & 0xff;
    buffer[7] = 0; // bBWI
    buffer[8] = 0; // wLevelParameter LSB
    buffer[9] = 0; // wLevelParameter MSB
    buffer.set(payload, 10);
    return buffer;
};

const parseCcidResponse = (result: USBInTransferResult) => {
    if (result.status !== "ok" || !result.data) {
        throw new Error(`การอ่านข้อมูลล้มเหลว (status: ${result.status})`);
    }
    const view = result.data;
    const length = view.getUint32(3, true);
    const payloadOffset = view.byteOffset + 10;
    const available = Math.max(0, view.byteLength - 10);
    const payload = new Uint8Array(view.buffer, payloadOffset, Math.min(length, available));
    return { messageType: view.getUint8(0), slot: view.getUint8(1), sequence: view.getUint8(2), payload };
};

declare global {
    interface Navigator {
        usb?: USB;
        hid?: HID;
    }
}

export default function TestCardReaderPage() {
    const [devices, setDevices] = useState<ReaderDevice[]>([]);
    const [statusLabel, setStatusLabel] = useState("รอการตรวจสอบอุปกรณ์");
    const [eventLog, setEventLog] = useState<string[]>([]);
    const [supports, setSupports] = useState<{ usb: boolean; hid: boolean }>({ usb: false, hid: false });
    const [isMobileBrowser, setIsMobileBrowser] = useState(false);
    const [selectedUsbDevice, setSelectedUsbDevice] = useState<USBDevice | null>(null);
    const [selectedInterface, setSelectedInterface] = useState<number | null>(null);
    const [outEndpoint, setOutEndpoint] = useState<number | null>(null);
    const [inEndpoint, setInEndpoint] = useState<number | null>(null);
    const [deviceBusy, setDeviceBusy] = useState(false);
    const [atrValue, setAtrValue] = useState<string | null>(null);
    const [cardLog, setCardLog] = useState<string[]>([]);
    const [apduInput, setApduInput] = useState("00A4040007A000000054480001");
    const [cardInfo, setCardInfo] = useState<CardInfo>({
        idNumber: "",
        fullName: "",
        fullNameEn: "",
        sex: "",
        birthDate: "",
        age: "",
        issueDate: "",
        expiryDate: "",
        address: "",
        cardStatus: "",
        statusCode: "",
        readerName: "",
    });
    const sequenceRef = useRef(0);

    const logMessage = useCallback((message: string) => {
        setEventLog((prev) => [message, ...prev].slice(0, 6));
    }, []);

    const logCardEvent = useCallback(
        (message: string) => {
            setCardLog((prev) => [message, ...prev].slice(0, 6));
            logMessage(message);
        },
        [logMessage]
    );

    const updateDeviceList = useCallback(async () => {
        if (typeof navigator === "undefined") return;
        const usbApi = navigator.usb;
        const hidApi = navigator.hid;
        const collected: ReaderDevice[] = [];

        if (usbApi) {
            try {
                const usbDevices = await usbApi.getDevices();
                collected.push(...usbDevices.map(mapUsbDevice));
            } catch (error) {
                logMessage(`ไม่สามารถอ่านอุปกรณ์ USB: ${error instanceof Error ? error.message : "ไม่รู้จัก"}`);
            }
        }

        if (hidApi) {
            try {
                const hidDevices = await hidApi.getDevices();
                collected.push(...hidDevices.map(mapHidDevice));
            } catch (error) {
                logMessage(`ไม่สามารถอ่านอุปกรณ์ HID: ${error instanceof Error ? error.message : "ไม่รู้จัก"}`);
            }
        }

        setDevices(collected);
        const stamp = new Date().toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
        setStatusLabel(collected.length ? `พบ ${collected.length} อุปกรณ์ · อัปเดตล่าสุด ${stamp}` : "ยังไม่พบเครื่องอ่านบัตรที่เชื่อมต่อ");
    }, [logMessage]);

    const tearDownDevice = useCallback(async () => {
        if (!selectedUsbDevice) return;
        try {
            if (selectedInterface !== null) {
                await selectedUsbDevice.releaseInterface(selectedInterface);
            }
        } catch {
            // ignore
        }
        try {
            await selectedUsbDevice.close();
        } catch {
            // ignore
        }
        setSelectedUsbDevice(null);
        setSelectedInterface(null);
        setOutEndpoint(null);
        setInEndpoint(null);
        sequenceRef.current = 0;
        setAtrValue(null);
    }, [selectedInterface, selectedUsbDevice]);

    useEffect(() => {
        return () => {
            void tearDownDevice();
        };
    }, [tearDownDevice]);

    const prepareUsbDevice = useCallback(
        async (device: USBDevice) => {
            await tearDownDevice();

            if (!device.opened) {
                await device.open();
            }

            if (!device.configuration) {
                const desired = device.configurations?.[0]?.configurationValue ?? 1;
                await device.selectConfiguration(desired);
            }

            const configuration = device.configuration;
            if (!configuration) {
                throw new Error("ไม่พบ configuration ของเครื่องอ่าน");
            }

            const ccidInterface = configuration.interfaces.find((iface) =>
                iface.alternates.some((alt) => alt.interfaceClass === 0x0b)
            );

            const alternate = ccidInterface?.alternates.find((alt) => alt.interfaceClass === 0x0b);
            const outEp = alternate?.endpoints?.find((ep) => ep.direction === "out" && ep.type === "bulk");
            const inEp = alternate?.endpoints?.find((ep) => ep.direction === "in" && ep.type === "bulk");

            if (!ccidInterface || !outEp || !inEp) {
                console.error("CCID interfaces:", configuration.interfaces);
                throw new Error("ไม่พบ interface/endpoint ที่รองรับ CCID");
            }

            await device.claimInterface(ccidInterface.interfaceNumber);

            setSelectedUsbDevice(device);
            setSelectedInterface(ccidInterface.interfaceNumber);
            setOutEndpoint(outEp.endpointNumber);
            setInEndpoint(inEp.endpointNumber);
            setStatusLabel("อุปกรณ์พร้อมอ่านบัตร");
            sequenceRef.current = 0;
            setAtrValue(null);
            setCardLog([]);

            logMessage(
                `เตรียมอุปกรณ์เรียบร้อย (iface=${ccidInterface.interfaceNumber}, OUT=${outEp.endpointNumber}, IN=${inEp.endpointNumber})`
            );
        },
        [tearDownDevice, logMessage]
    );


    useEffect(() => {
        if (typeof navigator === "undefined") return;
        const nav = navigator;
        setSupports({ usb: !!nav.usb, hid: !!nav.hid });
        updateDeviceList();
        const refresh = () => updateDeviceList();
        nav.usb?.addEventListener("connect", refresh);
        nav.usb?.addEventListener("disconnect", refresh);
        nav.hid?.addEventListener("connect", refresh);
        nav.hid?.addEventListener("disconnect", refresh);
        return () => {
            nav.usb?.removeEventListener("connect", refresh);
            nav.usb?.removeEventListener("disconnect", refresh);
            nav.hid?.removeEventListener("connect", refresh);
            nav.hid?.removeEventListener("disconnect", refresh);
        };
    }, [updateDeviceList]);

    useEffect(() => {
        if (typeof navigator === "undefined") return;
        const mobilePattern = /Mobi|Android|iPhone|iPad|Tablet/i;
        setIsMobileBrowser(mobilePattern.test(navigator.userAgent));
    }, []);

    const readAtr = useCallback(async () => {
        if (!selectedUsbDevice || outEndpoint === null || inEndpoint === null) {
            logCardEvent("ยังไม่มีเครื่องอ่าน USB ที่พร้อมอ่านบัตร");
            return;
        }
        setDeviceBusy(true);
        try {
            const sequence = sequenceRef.current;
            const block = buildPowerOnBlock(sequence);
            sequenceRef.current = (sequence + 1) & 0xff;
            const transfer = await selectedUsbDevice.transferOut(outEndpoint, block);
            if (transfer.status !== "ok") {
                throw new Error(`ส่งคำสั่ง Power On ล้มเหลว (status=${transfer.status})`);
            }
            const incoming = await selectedUsbDevice.transferIn(inEndpoint, 512);
            const parsed = parseCcidResponse(incoming);
            if (parsed.messageType !== 0x80) {
                throw new Error(`ไม่พบ ATR (messageType=${parsed.messageType})`);
            }
            const atrHex = bytesToHex(parsed.payload);
            setAtrValue(atrHex);
            logCardEvent(`ATR: ${atrHex}`);
        } catch (error) {
            logCardEvent(`อ่าน ATR ไม่สำเร็จ: ${error instanceof Error ? error.message : "ไม่รู้จัก"}`);
        } finally {
            setDeviceBusy(false);
        }
    }, [inEndpoint, logCardEvent, outEndpoint, selectedUsbDevice]);

    const sendApdu = useCallback(async () => {
        if (!selectedUsbDevice || outEndpoint === null || inEndpoint === null) {
            logCardEvent("เลือกเครื่องอ่านแล้ว Power On ก่อนส่งคำสั่ง APDU");
            return;
        }
        setDeviceBusy(true);
        try {
            const payload = hexToBytes(apduInput);
            const sequence = sequenceRef.current;
            const block = buildXfrBlock(sequence, payload);
            sequenceRef.current = (sequence + 1) & 0xff;
            const transfer = await selectedUsbDevice.transferOut(outEndpoint, block);
            if (transfer.status !== "ok") {
                throw new Error(`ส่งคำสั่ง APDU ล้มเหลว (status=${transfer.status})`);
            }
            const incoming = await selectedUsbDevice.transferIn(inEndpoint, 512);
            const parsed = parseCcidResponse(incoming);
            const responseHex = bytesToHex(parsed.payload);
            logCardEvent(`APDU → ${responseHex}`);
        } catch (error) {
            logCardEvent(`APDU ผิดพลาด: ${error instanceof Error ? error.message : "ไม่รู้จัก"}`);
        } finally {
            setDeviceBusy(false);
        }
    }, [apduInput, inEndpoint, logCardEvent, outEndpoint, selectedUsbDevice]);

    const handleUsbScan = useCallback(async () => {
        if (typeof navigator === "undefined" || !supports.usb) {
            const message = "เบราว์เซอร์นี้ไม่รองรับ WebUSB";
            setStatusLabel(message);
            logMessage(message);
            return;
        }
        setDeviceBusy(true);
        try {
            const usbInterface = navigator.usb;
            if (!usbInterface) {
                const message = "WebUSB ยังไม่พร้อมใช้งาน";
                setStatusLabel(message);
                logMessage(message);
                return;
            }
            const device = await usbInterface.requestDevice({ filters: SMART_CARD_FILTERS });
            logMessage(`เลือก USB: ${device.productName ?? "ไม่ระบุชื่อ"}`);
            setStatusLabel("อุปกรณ์พร้อมอ่านบัตร");
            await updateDeviceList();
            await prepareUsbDevice(device);
        } catch (error) {
            const reason = error instanceof Error ? error.message : "ยกเลิกการเลือกอุปกรณ์";
            logMessage(`WebUSB: ${reason}`);
            setStatusLabel(reason.includes("cancel") ? "การสแกนถูกยกเลิก" : "ไม่พบอุปกรณ์");
        } finally {
            setDeviceBusy(false);
        }
    }, [logMessage, prepareUsbDevice, supports.usb, updateDeviceList]);

    const handleHidScan = useCallback(async () => {
        if (typeof navigator === "undefined" || !supports.hid) {
            const message = "เบราว์เซอร์นี้ไม่รองรับ WebHID";
            setStatusLabel(message);
            logMessage(message);
            return;
        }
        try {
            const devices = await navigator.hid?.requestDevice({ filters: HID_SMART_CARD_FILTERS });
            if (devices && devices.length) {
                logMessage(`เลือก HID: ${devices[0].productName ?? "ไม่ระบุชื่อ"}`);
                setStatusLabel("อุปกรณ์ HID พร้อมใช้งาน");
            }
            await updateDeviceList();
        } catch (error) {
            const reason = error instanceof Error ? error.message : "ยกเลิกการเลือกอุปกรณ์";
            logMessage(`WebHID: ${reason}`);
            setStatusLabel(reason.includes("cancel") ? "การสแกนถูกยกเลิก" : "ไม่พบอุปกรณ์");
        }
    }, [logMessage, supports.hid, updateDeviceList]);

    const cardActionsDisabled = !selectedUsbDevice || outEndpoint === null || inEndpoint === null || deviceBusy || !supports.usb;

    return (
        <main className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-xl-10">
                    <div className="rounded-4 border bg-white shadow-sm p-4 p-lg-5">
                        <div className="text-center mb-5">
                            <p className="text-uppercase fw-semibold text-secondary mb-1">Test</p>
                            <h1 className="h2 fw-bold">ทดสอบเครื่องอ่านบัตรประชาชน</h1>
                            <p className="text-muted mb-0">
                                หน้าเดียวกันนี้ตรวจสอบ WebUSB/WebHID และส่งคำสั่ง CCID เพื่อให้สามารถต่อยอดการอ่านบัตรได้ทั้งบน PC และอุปกรณ์มือถือ
                            </p>
                        </div>

                        <div className="row g-4">
                            <div className="col-lg-5">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-body">
                                        <h2 className="h5">สถานะการเชื่อมต่อ</h2>
                                        <p className="fs-5 fw-semibold text-primary mb-2">{statusLabel}</p>

                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between">
                                                <span className="fw-semibold">WebUSB (PC)</span>
                                                <span className={supports.usb ? "text-success" : "text-secondary"}>
                                                    {supports.usb ? "รองรับ" : "ไม่รองรับ"}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="fw-semibold">WebHID (มือถือ/บางเบราว์เซอร์)</span>
                                                <span className={supports.hid ? "text-success" : "text-secondary"}>
                                                    {supports.hid ? "รองรับ" : "ไม่รองรับ"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="d-grid gap-2 mb-3">
                                            <button type="button" className="btn btn-primary" onClick={handleUsbScan} disabled={!supports.usb || deviceBusy}>
                                                สแกนเครื่องอ่าน USB (PC)
                                            </button>
                                            <button type="button" className="btn btn-outline-primary" onClick={handleHidScan} disabled={!supports.hid}>
                                                สแกนเครื่องอ่าน HID (Android/เบราว์เซอร์ที่รองรับ)
                                            </button>
                                        </div>

                                        <div className="small text-muted mb-3">
                                            {supports.usb || supports.hid ? (
                                                "หากไม่มีเครื่องอ่านให้เสียบสาย USB แล้วแตะปุ่มสแกนอีกครั้ง"
                                            ) : (
                                                "แนะนำให้เปิดด้วย Chrome/Edge บนพีซี หรือ Chrome บน Android เพื่อใช้งาน"
                                            )}
                                        </div>

                                        <div className="mt-4">
                                            <h3 className="h6 text-uppercase text-muted">กิจกรรมล่าสุด</h3>
                                            <ul className="list-unstyled mb-0 small">
                                                {eventLog.length ? (
                                                    eventLog.map((entry, index) => (
                                                        <li key={entry + index} className="py-1 border-bottom border-secondary border-opacity-25">
                                                            {entry}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="text-muted">รอการดำเนินการจากผู้ใช้</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-7">
                                <div className="border rounded-4 shadow-sm h-100 p-4">
                                    <div className="d-flex justify-content-between align-items-baseline mb-3">
                                        <div>
                                            <h2 className="h5 mb-2">อุปกรณ์ที่ระบบสามารถมองเห็น</h2>
                                            <p className="text-muted small mb-0">
                                                รีเฟรชรายการหากต่อเครื่องอ่านใหม่ หรือรู้สึกว่ายังไม่มีอุปกรณ์แสดง
                                            </p>
                                        </div>
                                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={updateDeviceList}>
                                            รีเฟรช
                                        </button>
                                    </div>

                                    {devices.length ? (
                                        <div className="list-group list-group-flush">
                                            {devices.map((device) => (
                                                <div key={device.id} className="list-group-item bg-transparent border-0 px-0 py-3">
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <span className="fw-semibold">{device.label}</span>
                                                        <span className="badge bg-secondary bg-opacity-10 text-dark">{device.kind}</span>
                                                    </div>
                                                    <p className="mb-0 small text-muted">{device.info}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted mb-0">
                                            ยังไม่พบเครื่องอ่านที่เชื่อมต่อ อย่าลืมเสียบสายและแตะปุ่มสแกนด้านซ้าย
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="border rounded-4 shadow-sm p-4">
                                <div className="row g-4">
                                    <div className="col-lg-8">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <div>
                                                <p className="text-uppercase small fw-semibold text-muted mb-1">เลขประจำตัวประชาชน</p>
                                                <h1 className="h3 mb-0">{cardInfo.idNumber}</h1>
                                            </div>
                                            <span className="badge bg-success bg-opacity-15 text-success">{cardInfo.cardStatus}</span>
                                        </div>
                                        <div className="d-flex gap-4 flex-wrap mb-3">
                                            <div>
                                                <p className="small text-uppercase text-muted mb-1">ชื่อ-นามสกุล</p>
                                                <p className="fw-semibold mb-0">{cardInfo.fullName}</p>
                                                <p className="text-muted small mb-0">{cardInfo.fullNameEn}</p>
                                            </div>
                                            <div>
                                                <p className="small text-uppercase text-muted mb-1">เพศ</p>
                                                <p className="mb-0">{cardInfo.sex}</p>
                                            </div>
                                            <div>
                                                <p className="small text-uppercase text-muted mb-1">วันเกิด</p>
                                                <p className="mb-0">{cardInfo.birthDate} · {cardInfo.age}</p>
                                            </div>
                                        </div>
                                        <div className="row row-cols-1 row-cols-md-2 g-3">
                                            <div>
                                                <p className="small text-uppercase text-muted mb-1">วันที่ออกบัตร</p>
                                                <p className="mb-0 fw-semibold">{cardInfo.issueDate}</p>
                                            </div>
                                            <div>
                                                <p className="small text-uppercase text-muted mb-1">วันหมดอายุ</p>
                                                <p className="mb-0 fw-semibold">{cardInfo.expiryDate}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <p className="small text-uppercase text-muted mb-1">ที่อยู่ตามบัตร</p>
                                            <p className="mb-0">{cardInfo.address}</p>
                                        </div>
                                    </div>
                                    <div className="col-lg-4">
                                        <div className="border rounded-4 p-3 h-100 d-flex flex-column justify-content-between">
                                            <div>
                                                <div className="ratio ratio-1x1 rounded mb-2" style={{ backgroundColor: "#f5f5f5" }}>
                                                    <div className="d-flex justify-content-center align-items-center h-100 text-muted">ภาพถ่าย</div>
                                                </div>
                                                <p className="text-uppercase small text-muted mb-1">เลขที่บัตรประชาชน</p>
                                                <p className="fs-5 fw-semibold mb-1">{cardInfo.statusCode}</p>
                                                <p className="small text-muted mb-0">{cardInfo.readerName}</p>
                                            </div>
                                            <div className="mt-3">
                                                <p className="small text-uppercase text-muted mb-1">ระบบบันทึก</p>
                                                <div className="bg-dark text-white rounded-3 px-3 py-2 small">
                                                    FAST ID STATUS
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <div className="small text-uppercase text-muted mb-2">System Logs</div>
                                    <div className="bg-light border rounded-3 p-3" style={{ minHeight: 140 }}>
                                        {cardLog.length ? (
                                            <ul className="list-unstyled mb-0 small">
                                                {cardLog.map((entry, index) => (
                                                    <li key={entry + index} className="pb-2 border-bottom border-secondary border-opacity-25">
                                                        {entry}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="small text-muted mb-0">ยังไม่พบข้อมูลบันทึก</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <div className="border rounded-4 shadow-sm p-4">
                                <div className="d-flex flex-column flex-lg-row gap-3 align-items-start">
                                    <div className="flex-fill">
                                        <h2 className="h5">อ่านบัตรประชาชน</h2>
                                        <p className="text-muted small mb-2">
                                            ส่งคำสั่ง CCID โดยตรงผ่าน WebUSB เพื่อดึง ATR และส่ง APDU (อ่านข้อมูลบัตรต่อจากนี้ได้ง่ายขึ้น)
                                        </p>
                                        <div className="d-flex gap-2 flex-wrap mb-3">
                                            <button className="btn btn-outline-success" onClick={readAtr} disabled={cardActionsDisabled}>
                                                เปิดบัตร (Power On)
                                            </button>
                                            <button className="btn btn-success" onClick={sendApdu} disabled={cardActionsDisabled}>
                                                ส่ง APDU
                                            </button>
                                        </div>
                                        <div className="mb-2">
                                            <label className="form-label small text-muted mb-1">คำสั่ง APDU (HEX)</label>
                                            <input
                                                className="form-control form-control-sm"
                                                value={apduInput}
                                                onChange={(event) => setApduInput(event.target.value)}
                                                placeholder="ตัวอย่าง: 00A4040007A000000054480001"
                                            />
                                        </div>
                                        <div className="d-flex gap-2 flex-wrap">
                                            <span className="badge bg-info bg-opacity-10 text-info">ATR</span>
                                            <p className="mb-0 small">{atrValue ?? "ยังไม่อ่าน"}</p>
                                        </div>
                                    </div>
                                    <div className="flex-fill">
                                        <h3 className="h6 text-uppercase text-muted">ขั้นตอนอัตโนมัติ</h3>
                                        <div className="bg-dark text-white rounded-3 p-3" style={{ minHeight: 160 }}>
                                            <ul className="list-unstyled mb-0 small">
                                                <li>Card Disconnected.</li>
                                                <li>Step 1 Card Connected.</li>
                                                <li>Step 2 Read card information.</li>
                                                <li>Step 3 Read the picture.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <h2 className="h4">คำแนะนำเพิ่มเติม</h2>
                            <div className="row row-cols-1 row-cols-md-2 g-3 mt-3">
                                <div className="col">
                                    <div className="p-3 border rounded-3 h-100">
                                        <h3 className="h6">บน PC</h3>
                                        <ul className="ps-3 mb-0">
                                            <li>ใช้ Chrome หรือ Edge บน Windows 10/11 เพื่อรับรอง WebUSB</li>
                                            <li>หากไม่เห็นเครื่องอ่านให้ตรวจสอบ Device Manager ว่าไดรเว์อร์ "Alcorlink" ถูกติดตั้ง</li>
                                            <li>เปิดหน้านี้แล้วแตะ "สแกนเครื่องอ่าน USB" เพื่อให้อุปกรณ์ถามสิทธิ์</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="p-3 border rounded-3 h-100">
                                        <h3 className="h6">บนมือถือ</h3>
                                        <ul className="ps-3 mb-0">
                                            <li>Android (Chrome/Edge) รองรับ WebHID; iOS/Safari ยังไม่รองรับ</li>
                                            <li>เปิดหน้าเว็บนี้จากเบราว์เซอร์ที่รองรับ และแตะ "สแกนเครื่องอ่าน HID"</li>
                                            <li>หากยังไม่มีการตอบกลับ ลองสลับสาย USB หรือใช้ฐาน OTG ในกล้อง</li>
                                        </ul>
                                        {isMobileBrowser && (
                                            <p className="small text-muted mb-0">
                                                อยู่ระหว่างเรียกดูจากอุปกรณ์โมบายล์ เลือกปุ่ม HID หากต้องการใช้งานผ่าน USB-C
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
