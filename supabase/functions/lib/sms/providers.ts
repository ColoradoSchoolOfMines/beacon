/**
 * @file SMS providers
 *
 * @note This file is generated automatically. Do not edit!
 *
 * @see https://github.com/mfitzp/List_of_SMS_gateways/blob/master/email2sms.csv
 */

import { Provider } from "~/lib/sms/index.ts";
import * as gateways from "~/lib/sms/gateways.ts";

/**
 * ameritech provider
 */
export const ameritech: Provider = {
  country: "US",
  names: ["Ameritech"],
  gateways: [gateways.pagingAcswirelessCom],
};

/**
 * assuranceWireless provider
 */
export const assuranceWireless: Provider = {
  country: "US",
  names: ["Assurance Wireless"],
  gateways: [gateways.vmoblCom],
};

/**
 * atTEnterprisePaging provider
 */
export const atTEnterprisePaging: Provider = {
  country: "US",
  names: ["AT&T Enterprise Paging"],
  gateways: [gateways.pageAttNet],
};

/**
 * atTGlobalSmartMessagingSuite provider
 * @note Powered by Soprano
 */
export const atTGlobalSmartMessagingSuite: Provider = {
  country: "US",
  names: ["AT&T Global Smart Messaging Suite"],
  gateways: [gateways.smsSmartmessagingsuiteCom],
};

/**
 * atTMobility provider
 * @note Omit country code in number
 */
export const atTMobility: Provider = {
  country: "US",
  names: ["AT&T Mobility"],
  gateways: [
    gateways.txtAttNet,
    gateways.cingularmeCom,
    gateways.mobileMycingularCom,
  ],
};

/**
 * bellMobilitySoloMobile provider
 */
export const bellMobilitySoloMobile: Provider = {
  country: "CA",
  names: ["Bell Mobility & Solo Mobile"],
  gateways: [gateways.txtBellCa, gateways.txtBellmobilityCa],
};

/**
 * bluegrassCellular provider
 */
export const bluegrassCellular: Provider = {
  country: "US",
  names: ["Bluegrass Cellular"],
  gateways: [gateways.smsBluecellCom],
};

/**
 * cellcom provider
 */
export const cellcom: Provider = {
  country: "US",
  names: ["Cellcom"],
  gateways: [gateways.cellcomQuiktxtCom],
};

/**
 * cellularSouth provider
 */
export const cellularSouth: Provider = {
  country: "US",
  names: ["Cellular South"],
  gateways: [gateways.csouth1Com],
};

/**
 * centennialWireless provider
 */
export const centennialWireless: Provider = {
  country: "US",
  names: ["Centennial Wireless"],
  gateways: [gateways.cwemailCom],
};

/**
 * charitonValleyWireless provider
 */
export const charitonValleyWireless: Provider = {
  country: "US",
  names: ["Chariton Valley Wireless"],
  gateways: [gateways.smsCvalleyNet],
};

/**
 * cingular provider
 * @note Must be logged in prior to visiting link
 */
export const cingular: Provider = {
  country: "US",
  names: ["Cingular"],
  gateways: [gateways.cingularCom, gateways.mobileMycingularCom],
};

/**
 * consumerCellular provider
 * @note Reported not working (2016); Reported working (2017)
 */
export const consumerCellular: Provider = {
  country: "US",
  names: ["Consumer Cellular"],
  gateways: [gateways.cingularmeCom, gateways.mailmymobileNet],
};

/**
 * cSpireWireless provider
 */
export const cSpireWireless: Provider = {
  country: "US",
  names: ["C Spire Wireless"],
  gateways: [gateways.cspire1Com],
};

/**
 * dtc provider
 */
export const dtc: Provider = {
  country: "US",
  names: ["DTC"],
  gateways: [gateways.smsAdvantagecellNet],
};

/**
 * esendex provider
 */
export const esendex: Provider = {
  country: "US",
  names: ["Esendex"],
  gateways: [gateways.echoemailNet],
};

/**
 * generalCommunicationsInc provider
 */
export const generalCommunicationsInc: Provider = {
  country: "US",
  names: ["General Communications Inc."],
  gateways: [gateways.mobileGciNet],
};

/**
 * globalstar provider
 */
export const globalstar: Provider = {
  names: ["Globalstar"],
  gateways: [gateways.msgGlobalstarusaCom],
};

/**
 * goldenStateCellular provider
 */
export const goldenStateCellular: Provider = {
  country: "US",
  names: ["Golden State Cellular"],
  gateways: [gateways.gscsmsCom],
};

/**
 * googleFi provider
 * @note Will not work with Hangouts integration - messages will only be sent directly to activated handset in the default SMS application (Android Messages).
 */
export const googleFi: Provider = {
  names: ["Google Fi"],
  gateways: [gateways.msgFiGoogleCom],
};

/**
 * iridium provider
 */
export const iridium: Provider = {
  names: ["Iridium"],
  gateways: [gateways.msgIridiumCom],
};

/**
 * iWireless provider
 */
export const iWireless: Provider = {
  country: "US",
  names: ["i wireless", "i-wireless"],
  gateways: [gateways.iwspcsNet, gateways.iwirelesshometextCom],
};

/**
 * koodoMobile provider
 */
export const koodoMobile: Provider = {
  country: "CA",
  names: ["Koodo Mobile"],
  gateways: [gateways.msgTelusCom],
};

/**
 * longLines provider
 */
export const longLines: Provider = {
  country: "US",
  names: ["LongLines"],
  gateways: [gateways.textLonglinesCom],
};

/**
 * metroPcs provider
 */
export const metroPcs: Provider = {
  country: "US",
  names: ["MetroPCS"],
  gateways: [gateways.mymetropcsCom],
};

/**
 * nextech provider
 */
export const nextech: Provider = {
  country: "US",
  names: ["Nextech"],
  gateways: [gateways.smsNtwlsNet],
};

/**
 * nTelos provider
 */
export const nTelos: Provider = {
  country: "US",
  names: ["nTelos"],
  gateways: [gateways.pcsNtelosCom],
};

/**
 * pagePlusCellular provider
 * @note Previously number@vzwpix.com for MMS but reported no longer working (2017)
 */
export const pagePlusCellular: Provider = {
  country: "US",
  names: ["Page Plus Cellular"],
  gateways: [gateways.vtextCom],
};

/**
 * pcTelecom provider
 */
export const pcTelecom: Provider = {
  country: "CA",
  names: ["PC Telecom"],
  gateways: [gateways.mobiletxtCa],
};

/**
 * pioneerCellular provider
 */
export const pioneerCellular: Provider = {
  country: "US",
  names: ["Pioneer Cellular"],
  gateways: [gateways.zsendCom],
};

/**
 * qwestWireless provider
 */
export const qwestWireless: Provider = {
  country: "US",
  names: ["Qwest Wireless"],
  gateways: [gateways.qwestmpCom],
};

/**
 * redPocketMobile provider
 */
export const redPocketMobile: Provider = {
  country: "US",
  names: ["Red Pocket Mobile"],
  gateways: [gateways.txtAttNet],
};

/**
 * rogersWireless provider
 * @note Updated (2016)
 */
export const rogersWireless: Provider = {
  country: "CA",
  names: ["Rogers Wireless"],
  gateways: [gateways.pcsRogersCom],
};

/**
 * saskTel provider
 * @note Obsolete (2016)
 */
export const saskTel: Provider = {
  country: "CA",
  names: ["SaskTel"],
  gateways: [gateways.pcsSasktelmobilityCom, gateways.smsSasktelCom],
};

/**
 * simpleMobile provider
 */
export const simpleMobile: Provider = {
  country: "US",
  names: ["Simple Mobile"],
  gateways: [gateways.smtextCom],
};

/**
 * southCentralCommunications provider
 */
export const southCentralCommunications: Provider = {
  country: "US",
  names: ["South Central Communications"],
  gateways: [gateways.rinasmsCom],
};

/**
 * southernlinc provider
 */
export const southernlinc: Provider = {
  country: "US",
  names: ["Southernlinc"],
  gateways: [gateways.pageSouthernlincCom],
};

/**
 * sprint provider
 */
export const sprint: Provider = {
  country: "US",
  names: ["Sprint"],
  gateways: [gateways.messagingSprintpcsCom, gateways.pmSprintCom],
};

/**
 * straightTalk provider
 */
export const straightTalk: Provider = {
  country: "US",
  names: ["Straight Talk"],
  gateways: [
    gateways.messagingSprintpcsCom,
    gateways.txtAttNet,
    gateways.vtextCom,
  ],
};

/**
 * syringaWireless provider
 */
export const syringaWireless: Provider = {
  country: "US",
  names: ["Syringa Wireless"],
  gateways: [gateways.rinasmsCom],
};

/**
 * teleflip provider
 */
export const teleflip: Provider = {
  country: "US",
  names: ["Teleflip"],
  gateways: [gateways.teleflipCom],
};

/**
 * telusMobility provider
 */
export const telusMobility: Provider = {
  country: "CA",
  names: ["Telus Mobility"],
  gateways: [gateways.msgTelusCom],
};

/**
 * ting provider
 */
export const ting: Provider = {
  country: "US",
  names: ["Ting"],
  gateways: [gateways.messageTingCom],
};

/**
 * tracFone provider
 * @note Indirect
 */
export const tracFone: Provider = {
  country: "US",
  names: ["TracFone"],
  gateways: [
    gateways.txtAttNet,
    gateways.emailUsccNet,
    gateways.tmomailNet,
    gateways.vtextCom,
  ],
};

/**
 * unionWireless provider
 */
export const unionWireless: Provider = {
  country: "US",
  names: ["Union Wireless"],
  gateways: [gateways.unionTelCom],
};

/**
 * usaMobility provider
 */
export const usaMobility: Provider = {
  country: "US",
  names: ["USA Mobility"],
  gateways: [gateways.usamobilityNet],
};

/**
 * usCellular provider
 */
export const usCellular: Provider = {
  country: "US",
  names: ["US Cellular"],
  gateways: [gateways.emailUsccNet],
};

/**
 * verizonWireless provider
 * @note Previously number@vzwpix.com for MMS but reported no longer working (2017)
 */
export const verizonWireless: Provider = {
  country: "US",
  names: ["Verizon Wireless"],
  gateways: [gateways.vtextCom],
};

/**
 * viaero provider
 */
export const viaero: Provider = {
  country: "US",
  names: ["Viaero"],
  gateways: [gateways.viaerosmsCom],
};

/**
 * virginMobile provider
 */
export const virginMobile: Provider = {
  country: "CA",
  names: ["Virgin Mobile"],
  gateways: [gateways.vmobileCa, gateways.vmoblCom],
};

/**
 * westCentralWireless provider
 */
export const westCentralWireless: Provider = {
  country: "US",
  names: ["West Central Wireless"],
  gateways: [gateways.smsWccNet],
};

/**
 * xitCommunications provider
 */
export const xitCommunications: Provider = {
  country: "US",
  names: ["XIT Communications"],
  gateways: [gateways.smsXitNet],
};
