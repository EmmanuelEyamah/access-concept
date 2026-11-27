import type { ImageSourcePropType } from "react-native";

export const LOGO = require("@/assets/logo/access-logo.png");
export const MARK = require("@/assets/logo/access-mark.png");

export const PHOTOS = {
  skyline: require("@/assets/img/skyline.jpg"),
  woman: require("@/assets/img/onb-woman.jpg"),
  shop: require("@/assets/img/onb-shop.jpg"),
  friends: require("@/assets/img/onb-friends.jpg"),
} as const;

export const PEOPLE = {
  user: require("@/assets/people/user.jpg"),
  adaeze: require("@/assets/people/adaeze.jpg"),
  tunde: require("@/assets/people/tunde.jpg"),
  halima: require("@/assets/people/halima.jpg"),
  chidi: require("@/assets/people/chidi.jpg"),
  ife: require("@/assets/people/ife.jpg"),
  blessing: require("@/assets/people/blessing.jpg"),
} as const;
export type PersonKey = keyof typeof PEOPLE;

export const BRANDS = {
  gtbank: require("@/assets/brands/gtbank.png"),
  opay: require("@/assets/brands/opay.png"),
  kuda: require("@/assets/brands/kuda.png"),
  zenith: require("@/assets/brands/zenith.png"),
  uba: require("@/assets/brands/uba.png"),
  moniepoint: require("@/assets/brands/moniepoint.png"),
  chowdeck: require("@/assets/brands/chowdeck.png"),
  mtn: require("@/assets/brands/mtn.png"),
  netflix: require("@/assets/brands/netflix.png"),
  dstv: require("@/assets/brands/dstv.png"),
  gotv: require("@/assets/brands/gotv.png"),
  showmax: require("@/assets/brands/showmax.png"),
  spotify: require("@/assets/brands/spotify.png"),
  airtel: require("@/assets/brands/airtel.png"),
  glo: require("@/assets/brands/glo.png"),
  ninemobile: require("@/assets/brands/ninemobile.png"),
  wema: require("@/assets/brands/wema.png"),
  palmpay: require("@/assets/brands/palmpay.png"),
  fidelity: require("@/assets/brands/fidelity.png"),
  union: require("@/assets/brands/union.png"),
  ekedc: require("@/assets/brands/ekedc.png"),
  bolt: require("@/assets/brands/bolt.png"),
  jumia: require("@/assets/brands/jumia.png"),
  apple: require("@/assets/brands/apple.png"),
  access: MARK,
} as const satisfies Record<string, ImageSourcePropType>;
export type BrandKey = keyof typeof BRANDS;
