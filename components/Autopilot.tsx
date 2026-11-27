import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { AUTOPILOT, RECIPIENTS } from "@/constants/data";
import { useBankStore } from "@/stores/useBankStore";

/**
 * Hands-free demo for checking and for timing recordings. EXPO_PUBLIC_AUTOPILOT picks the run:
 * "1" sends money end to end, "fail" ends on the failed screen, "tour" walks the tabs,
 * "shots" stops on every page and logs SHOT:<name> so a script can photograph each one.
 */
export const Autopilot = () => {
  const ready = useBankStore((s) => s.phase === "app");
  const played = useRef(false);

  useEffect(() => {
    if (!AUTOPILOT || !ready || played.current) return;
    played.current = true;
    const { setRecipient, setAmount, cueSend, cueServices, resetDraft } = useBankStore.getState();
    const at = (ms: number, run: () => void) => setTimeout(run, ms);

    if (AUTOPILOT === "shots") {
      const mark = (name: string) => console.log(`SHOT:${name}`);
      at(3600, () => mark("home"));
      at(5600, cueServices);
      at(7200, () => mark("services"));
      at(9000, cueServices);
      at(9800, () => router.push("/transfer"));
      at(11600, () => mark("recipient"));
      at(13200, () => {
        setRecipient(RECIPIENTS[0]);
        setAmount(25000);
        router.push("/transfer/amount");
      });
      at(15000, () => mark("amount"));
      at(16600, () => router.push("/transfer/review"));
      at(18400, () => mark("review"));
      at(20000, () => router.replace({ pathname: "/transfer/result", params: { state: "failed" } }));
      at(22400, () => mark("failed"));
      at(24000, () => router.replace({ pathname: "/transfer/result", params: { state: "success" } }));
      at(26400, () => mark("success"));
      at(28000, () => {
        router.dismissAll();
        router.push("/support");
      });
      at(30000, () => mark("support"));
      at(31600, () => {
        router.back();
        router.navigate("/profile");
      });
      at(33600, () => mark("profile"));
      at(35200, () => router.navigate("/history"));
      at(37200, () => mark("history"));
      at(38800, () => router.navigate("/cards"));
      at(40800, () => mark("cards"));
      at(42400, () => router.push("/transfer/new"));
      at(45200, () => mark("newrecipient"));
      at(46800, () => {
        router.back();
        router.push("/bills");
      });
      at(48800, () => mark("bills"));
      at(50400, () => router.push("/bills/airtime"));
      at(52400, () => mark("airtime"));
      at(54000, () => {
        router.dismissAll();
        router.push({ pathname: "/tx/[id]", params: { id: "t6" } });
      });
      at(56000, () => mark("transaction"));
      at(57600, () => {
        router.back();
        router.push("/add-money");
      });
      at(59600, () => mark("addmoney"));
      at(61200, () => {
        router.back();
        router.push("/notifications");
      });
      at(63200, () => mark("notifications"));
      at(64800, () => mark("end"));
      return;
    }

    if (AUTOPILOT === "check") {
      const mark = (name: string) => console.log(`SHOT:${name}`);
      const { cue } = useBankStore.getState();
      at(1500, () => router.navigate("/cards"));
      at(3200, () => cue("autoFlip"));
      at(5000, () => mark("cardback"));
      at(6400, () => router.navigate("/history"));
      at(8200, () => cue("autoFilter"));
      at(10000, () => mark("filter"));
      at(11400, () => cue("autoFilter"));
      at(12400, () => {
        setRecipient({ id: "new-1", name: "Oluwaseun Adeleke", bank: "GTBank", brand: "gtbank", account: "0234 118 907" });
        router.push("/transfer/amount");
      });
      at(14400, () => mark("amountnew"));
      at(15800, () => {
        router.back();
        router.push("/bills/airtime");
      });
      at(17800, () => mark("airtime"));
      at(19200, () => mark("end"));
      return;
    }

    if (AUTOPILOT === "tour") {
      at(2600, () => router.navigate("/history"));
      at(5600, () => router.navigate("/cards"));
      at(8600, () => router.navigate("/profile"));
      at(11600, () => router.push("/support"));
      return;
    }

    at(3200, () => router.push("/transfer"));
    at(5200, () => {
      setRecipient(RECIPIENTS[0]);
      router.push("/transfer/amount");
    });
    [2, 25, 250, 2500, 25000].forEach((value, i) => at(6400 + i * 260, () => setAmount(value)));
    at(8400, () => router.push("/transfer/review"));
    if (AUTOPILOT === "fail") {
      at(10400, () => router.replace({ pathname: "/transfer/result", params: { state: "failed" } }));
      return;
    }
    at(10200, cueSend);
    at(17000, () => {
      resetDraft();
      router.dismissAll();
    });
  }, [ready]);

  return null;
};
