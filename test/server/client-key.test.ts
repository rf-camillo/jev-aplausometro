import { describe, expect, it } from "vitest";

import { clientKey, networkKey, networkOf } from "@/lib/server/client-key";

function request(headers: Record<string, string>): Request {
  return new Request("http://localhost/api/audience", { headers });
}

describe("clientKey", () => {
  it("trusts the platform's real address over a forwarded list the client can forge", () => {
    expect(
      clientKey(request({ "X-Real-IP": "203.0.113.7", "X-Forwarded-For": "1.1.1.1, 203.0.113.7" })),
    ).toBe("203.0.113.7");
  });

  it("falls back to the first forwarded address, then to a shared bucket", () => {
    expect(clientKey(request({ "X-Forwarded-For": " 198.51.100.2 , 10.0.0.1" }))).toBe(
      "198.51.100.2",
    );
    expect(clientKey(request({}))).toBe("unknown");
  });

  it("counts a whole IPv6 network as one client", () => {
    const a = clientKey(request({ "X-Real-IP": "2001:db8:abcd:12:1111:2222:3333:4444" }));
    const b = clientKey(request({ "X-Real-IP": "2001:db8:abcd:12::99" }));
    expect(a).toBe("2001:db8:abcd:12::/64");
    expect(b).toBe(a);
  });
});

describe("networkKey", () => {
  it("counts a whole /48 as one network, for the looser limit", () => {
    const a = networkKey(request({ "X-Real-IP": "2001:db8:abcd:12::1" }));
    const b = networkKey(request({ "X-Real-IP": "2001:db8:abcd:ffff::1" }));
    expect(a).toBe("2001:db8:abcd::/48");
    expect(b).toBe(a);
    expect(networkKey(request({ "X-Real-IP": "203.0.113.7" }))).toBe("203.0.113.7");
    expect(networkKey(request({}))).toBe("unknown");
  });
});

describe("networkOf", () => {
  it.each([
    ["203.0.113.7", "203.0.113.7"],
    ["::ffff:203.0.113.7", "203.0.113.7"],
    ["2001:0db8:0000:0042:0000:8a2e:0370:7334", "2001:db8:0:42::/64"],
    ["2001:db8::1", "2001:db8:0:0::/64"],
    ["::1", "0:0:0:0::/64"],
    ["FE80::1", "fe80:0:0:0::/64"],
    ["fe80::1%eth0", "fe80:0:0:0::/64"],
  ])("puts %s in %s", (address, network) => {
    expect(networkOf(address)).toBe(network);
  });
});
