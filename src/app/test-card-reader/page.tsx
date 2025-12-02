"use client";

import { useCallback, useEffect, useState } from "react";

type ReaderDevice = {
    id: string;
    label: string;
    kind: "USB" | "HID";
    info: string;
};

type UsbFilter = {
    classCode?: number;
    subclassCode?: number;
    protocolCode?: number;
    vendorId?: number;
    productId?: number;
    serialNumber?: string;
};

type HidFilter = {
    vendorId?: number;
    productId?: number;
    usagePage?: number;
    usage?: number;
};

type USBDevice = {
    vendorId?: number;
    productId?: number;
    productName?: string;
    manufacturerName?: string;
    serialNumber?: string;
};

type HIDDevice = USBDevice & {
    collections?: { usagePage?: number }[];
};

type UsbApi = {
    getDevices: () => Promise<USBDevice[]>;
    requestDevice: (options: { filters: UsbFilter[] }) => Promise<USBDevice>;
    addEventListener: (type: "connect" | "disconnect", listener: () => void) => void;
    removeEventListener: (type: "connect" | "disconnect", listener: () => void) => void;
};

type HidApi = {
    getDevices: () => Promise<HIDDevice[]>;
    requestDevice: (options: { filters: HidFilter[] }) => Promise<HIDDevice[]>;
    addEventListener: (type: "connect" | "disconnect", listener: () => void) => void;
    removeEventListener: (type: "connect" | "disconnect", listener: () => void) => void;
};

type NavigatorWithDevice = Navigator & {
    usb?: UsbApi;
    hid?: HidApi;
};

const SMART_CARD_FILTERS: UsbFilter[] = [{ classCode: 0x0b }];
const HID_SMART_CARD_FILTERS: HidFilter[] = [{ usagePage: 0x0b }];

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
        id: `${device.vendorId ?? 0}-${device.productId ?? 0}-${usagePage ?? 0}-${device.productName ?? "HID"
            }`,
        label: device.productName ?? "HID เครื่องอ่าน",
        kind: "HID",
        info: `VID ${toHex(device.vendorId)} · PID ${toHex(device.productId)}${usagePage ? ` · usage ${usagePage}` : ""
            }`,
    };
};

export default function TestCardReaderPage() {
    const [devices, setDevices] = useState<ReaderDevice[]>([]);
    const [statusLabel, setStatusLabel] = useState("รอการตรวจสอบอุปกรณ์");
    const [eventLog, setEventLog] = useState<string[]>([]);
    const [supports, setSupports] = useState({ usb: false, hid: false });
    const [isMobileBrowser, setIsMobileBrowser] = useState(false);

    const logMessage = useCallback((message: string) => {
        setEventLog((prev) => [message, ...prev].slice(0, 6));
    }, []);

    const updateDeviceList = useCallback(async () => {
        if (typeof window === "undefined") return;
        const navigatorWith = navigator as NavigatorWithDevice;
        const usbApi = navigatorWith.usb;
        const hidApi = navigatorWith.hid;
        const collected: ReaderDevice[] = [];

        if (usbApi) {
            try {
                const usbDevices = await usbApi.getDevices();
                collected.push(...usbDevices.map(mapUsbDevice));
            } catch (error) {
                logMessage(
                    `ไม่สามารถอ่านอุปกรณ์ USB: ${error instanceof Error ? error.message : "ไม่รู้จัก"
                    }`
                );
            }
        }

        if (hidApi) {
            try {
                const hidDevices = await hidApi.getDevices();
                collected.push(...hidDevices.map(mapHidDevice));
            } catch (error) {
                logMessage(
                    `ไม่สามารถอ่านอุปกรณ์ HID: ${error instanceof Error ? error.message : "ไม่รู้จัก"
                    }`
                );
            }
        }

        setDevices(collected);
        const stamp = new Date().toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
        setStatusLabel(
            collected.length
                ? `พบ ${collected.length} อุปกรณ์ · อัปเดตล่าสุด ${stamp}`
                : "ยังไม่พบเครื่องอ่านบัตรที่เชื่อมต่อ"
        );
    }, [logMessage]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const navigatorWith = navigator as NavigatorWithDevice;
        setSupports({
            usb: !!navigatorWith.usb,
            hid: !!navigatorWith.hid,
        });

        updateDeviceList();

        const usbApi = navigatorWith.usb;
        const hidApi = navigatorWith.hid;

        const refresh = () => updateDeviceList();

        usbApi?.addEventListener("connect", refresh);
        usbApi?.addEventListener("disconnect", refresh);
        hidApi?.addEventListener("connect", refresh);
        hidApi?.addEventListener("disconnect", refresh);

        return () => {
            usbApi?.removeEventListener("connect", refresh);
            usbApi?.removeEventListener("disconnect", refresh);
            hidApi?.removeEventListener("connect", refresh);
            hidApi?.removeEventListener("disconnect", refresh);
        };
    }, [updateDeviceList]);

    useEffect(() => {
        if (typeof navigator === "undefined") return;
        const mobilePattern = /Mobi|Android|iPhone|iPad|Tablet/i;
        setIsMobileBrowser(mobilePattern.test(navigator.userAgent));
    }, []);

    const handleUsbScan = useCallback(async () => {
        if (typeof window === "undefined" || !supports.usb) {
            const message = "เบราว์เซอร์นี้ไม่รองรับ WebUSB";
            setStatusLabel(message);
            logMessage(message);
            return;
        }
        try {
            const navigatorWith = navigator as NavigatorWithDevice;
            const usbApi = navigatorWith.usb;
            if (!usbApi) {
                const message = "เบราว์เซอร์นี้ไม่รองรับ WebUSB";
                setStatusLabel(message);
                logMessage(message);
                return;
            }
            const device = await usbApi.requestDevice({ filters: SMART_CARD_FILTERS });
            logMessage(`เลือก USB: ${device.productName ?? "ไม่ระบุชื่อ"}`);
            setStatusLabel("อุปกรณ์พร้อมอ่านข้อมูล");
            await updateDeviceList();
        } catch (error) {
            const reason = error instanceof Error ? error.message : "ยกเลิกการเลือกอุปกรณ์";
            logMessage(`WebUSB: ${reason}`);
            setStatusLabel(reason.includes("cancel") ? "การสแกนถูกยกเลิก" : "ไม่พบอุปกรณ์");
        }
    }, [supports.usb, updateDeviceList, logMessage]);

    const handleHidScan = useCallback(async () => {
        if (typeof window === "undefined" || !supports.hid) {
            const message = "เบราว์เซอร์นี้ไม่รองรับ WebHID";
            setStatusLabel(message);
            logMessage(message);
            return;
        }
        try {
            const navigatorWith = navigator as NavigatorWithDevice;
            const hidApi = navigatorWith.hid;
            if (!hidApi) {
                const message = "เบราว์เซอร์นี้ไม่รองรับ WebHID";
                setStatusLabel(message);
                logMessage(message);
                return;
            }
            const devices = await hidApi.requestDevice({ filters: HID_SMART_CARD_FILTERS });
            if (devices.length) {
                logMessage(`เลือก HID: ${devices[0].productName ?? "ไม่ระบุชื่อ"}`);
            }
            setStatusLabel("อุปกรณ์ HID พร้อมใช้งาน");
            await updateDeviceList();
        } catch (error) {
            const reason = error instanceof Error ? error.message : "ยกเลิกการเลือกอุปกรณ์";
            logMessage(`WebHID: ${reason}`);
            setStatusLabel(reason.includes("cancel") ? "การสแกนถูกยกเลิก" : "ไม่พบอุปกรณ์");
        }
    }, [supports.hid, updateDeviceList, logMessage]);

    return (
        <main className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-xl-10">
                    <div className="rounded-4 border bg-white shadow-sm p-4 p-lg-5">
                        <div className="text-center mb-5">
                            <p className="text-uppercase fw-semibold text-secondary mb-1">Test</p>
                            <h1 className="h2 fw-bold">ทดสอบเครื่องอ่านบัตรประชาชน</h1>
                            <p className="text-muted mb-0">
                                ใช้หน้าเดียวกันเพื่อยืนยันว่าระบบเห็นเครื่องอ่านบัตรทั้งบน PC และอุปกรณ์มือถือที่
                                รองรับ WebUSB / WebHID
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
                                                <span
                                                    className={
                                                        supports.usb ? "text-success" : "text-secondary"
                                                    }
                                                >
                                                    {supports.usb ? "รองรับ" : "ไม่รองรับ"}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="fw-semibold">WebHID (มือถือ/บางเบราว์เซอร์)</span>
                                                <span
                                                    className={
                                                        supports.hid ? "text-success" : "text-secondary"
                                                    }
                                                >
                                                    {supports.hid ? "รองรับ" : "ไม่รองรับ"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="d-grid gap-2 mb-3">
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={handleUsbScan}
                                                disabled={!supports.usb}
                                            >
                                                สแกนเครื่องอ่าน USB (PC)
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary"
                                                onClick={handleHidScan}
                                                disabled={!supports.hid}
                                            >
                                                สแกนเครื่องอ่าน HID (Android/เบราว์เซอร์ที่รองรับ)
                                            </button>
                                        </div>

                                        <div className="small text-muted">
                                            {supports.usb || supports.hid ? (
                                                <>
                                                    หากไม่มีเครื่องอ่านให้เสียบสาย USB แล้วแตะปุ่มสแกนอีกครั้ง
                                                </>
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
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={updateDeviceList}
                                        >
                                            รีเฟรช
                                        </button>
                                    </div>

                                    {devices.length ? (
                                        <div className="list-group list-group-flush">
                                            {devices.map((device) => (
                                                <div
                                                    key={device.id}
                                                    className="list-group-item bg-transparent border-0 px-0 py-3"
                                                >
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <span className="fw-semibold">{device.label}</span>
                                                        <span className="badge bg-secondary bg-opacity-10 text-dark">
                                                            {device.kind}
                                                        </span>
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

                        <div className="mt-5">
                            <h2 className="h4">คำแนะนำเพิ่มเติม</h2>
                            <div className="row row-cols-1 row-cols-md-2 g-3 mt-3">
                                <div className="col">
                                    <div className="p-3 border rounded-3 h-100">
                                        <h3 className="h6">บน PC</h3>
                                        <ul className="ps-3 mb-0">
                                            <li>ใช้ Chrome หรือ Edge บน Windows 10/11 เพื่อรับรอง WebUSB</li>
                                            <li>หากไม่เห็นเครื่องอ่านให้ตรวจสอบ Device Manager ว่าไดรเวอร์ "Alcorlink" ถูกติดตั้ง</li>
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
