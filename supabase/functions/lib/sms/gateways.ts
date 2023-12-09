/**
 * @file SMS gateways
 *
 * @note This file is generated automatically. Do not edit!
 *
 * @see https://github.com/mfitzp/List_of_SMS_gateways/blob/master/email2sms.csv
 */

import { Gateway } from "~/lib/sms/index.ts";

/**
 * cellcomQuiktxtCom gateway
 */
export const cellcomQuiktxtCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@cellcom.quiktxt.com`,
});

/**
 * cingularCom gateway
 * @note Must be logged in prior to visiting link
 */
export const cingularCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@cingular.com`,
});

/**
 * cingularmeCom gateway
 * @note Reported not working (2016); Reported working (2017)
 */
export const cingularmeCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@cingularme.com`,
});

/**
 * csouth1Com gateway
 */
export const csouth1Com: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@csouth1.com`,
});

/**
 * cspire1Com gateway
 */
export const cspire1Com: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@cspire1.com`,
});

/**
 * cwemailCom gateway
 */
export const cwemailCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@cwemail.com`,
});

/**
 * echoemailNet gateway
 */
export const echoemailNet: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@echoemail.net`,
});

/**
 * emailUsccNet gateway
 */
export const emailUsccNet: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@email.uscc.net`,
});

/**
 * esmsNu gateway
 */
export const esmsNu: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@esms.nu`,
});

/**
 * gscsmsCom gateway
 */
export const gscsmsCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@gscsms.com`,
});

/**
 * iwirelesshometextCom gateway
 */
export const iwirelesshometextCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@iwirelesshometext.com`,
});

/**
 * iwspcsNet gateway
 */
export const iwspcsNet: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}.iws@iwspcs.net`,
});

/**
 * mailmymobileNet gateway
 * @note Alternate address, seen as return address when texting to email (2017)
 */
export const mailmymobileNet: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@mailmymobile.net`,
});

/**
 * messageTingCom gateway
 */
export const messageTingCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@message.ting.com`,
});

/**
 * messagingSprintpcsCom gateway
 */
export const messagingSprintpcsCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@messaging.sprintpcs.com`,
});

/**
 * mobileGciNet gateway
 */
export const mobileGciNet: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@mobile.gci.net`,
});

/**
 * mobileMycingularCom gateway
 */
export const mobileMycingularCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@mobile.mycingular.com`,
});

/**
 * mobiletxtCa gateway
 */
export const mobiletxtCa: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@mobiletxt.ca`,
});

/**
 * msgFiGoogleCom gateway
 * @note Will not work with Hangouts integration - messages will only be sent directly to activated handset in the default SMS application (Android Messages).
 */
export const msgFiGoogleCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@msg.fi.google.com`,
});

/**
 * msgGlobalstarusaCom gateway
 */
export const msgGlobalstarusaCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@msg.globalstarusa.com`,
});

/**
 * msgIridiumCom gateway
 */
export const msgIridiumCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@msg.iridium.com`,
});

/**
 * msgTelusCom gateway
 */
export const msgTelusCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@msg.telus.com`,
});

/**
 * mymetropcsCom gateway
 */
export const mymetropcsCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@mymetropcs.com`,
});

/**
 * pageAttNet gateway
 */
export const pageAttNet: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@page.att.net`,
});

/**
 * pageSouthernlincCom gateway
 */
export const pageSouthernlincCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@page.southernlinc.com`,
});

/**
 * pagingAcswirelessCom gateway
 */
export const pagingAcswirelessCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@paging.acswireless.com`,
});

/**
 * pcsNtelosCom gateway
 */
export const pcsNtelosCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@pcs.ntelos.com`,
});

/**
 * pcsRogersCom gateway
 * @note Updated (2016)
 */
export const pcsRogersCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@pcs.rogers.com`,
});

/**
 * pcsSasktelmobilityCom gateway
 * @note Obsolete (2016)
 */
export const pcsSasktelmobilityCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@pcs.sasktelmobility.com`,
});

/**
 * pmSprintCom gateway
 */
export const pmSprintCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@pm.sprint.com`,
});

/**
 * qwestmpCom gateway
 */
export const qwestmpCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@qwestmp.com`,
});

/**
 * rinasmsCom gateway
 */
export const rinasmsCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@rinasms.com`,
});

/**
 * smsAdvantagecellNet gateway
 */
export const smsAdvantagecellNet: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@sms.advantagecell.net`,
});

/**
 * smsBluecellCom gateway
 */
export const smsBluecellCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@sms.bluecell.com`,
});

/**
 * smsCvalleyNet gateway
 */
export const smsCvalleyNet: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@sms.cvalley.net`,
});

/**
 * smsNtwlsNet gateway
 */
export const smsNtwlsNet: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@sms.ntwls.net`,
});

/**
 * smsSasktelCom gateway
 */
export const smsSasktelCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@sms.sasktel.com`,
});

/**
 * smsSmartmessagingsuiteCom gateway
 * @note Powered by Soprano
 */
export const smsSmartmessagingsuiteCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@sms.smartmessagingsuite.com`,
});

/**
 * smsWccNet gateway
 */
export const smsWccNet: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@sms.wcc.net`,
});

/**
 * smsXitNet gateway
 */
export const smsXitNet: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@sms.xit.net`,
});

/**
 * smtextCom gateway
 */
export const smtextCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@smtext.com`,
});

/**
 * teleflipCom gateway
 */
export const teleflipCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@teleflip.com`,
});

/**
 * textLonglinesCom gateway
 */
export const textLonglinesCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@text.longlines.com`,
});

/**
 * tmomailNet gateway
 */
export const tmomailNet: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@tmomail.net`,
});

/**
 * txtAttNet gateway
 * @note Omit country code in number
 */
export const txtAttNet: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@txt.att.net`,
});

/**
 * txtBellCa gateway
 */
export const txtBellCa: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@txt.bell.ca`,
});

/**
 * txtBellmobilityCa gateway
 */
export const txtBellmobilityCa: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@txt.bellmobility.ca`,
});

/**
 * unionTelCom gateway
 */
export const unionTelCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@union-tel.com`,
});

/**
 * usamobilityNet gateway
 */
export const usamobilityNet: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@usamobility.net`,
});

/**
 * viaerosmsCom gateway
 */
export const viaerosmsCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@viaerosms.com`,
});

/**
 * vmobileCa gateway
 */
export const vmobileCa: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@vmobile.ca`,
});

/**
 * vmoblCom gateway
 */
export const vmoblCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@vmobl.com`,
});

/**
 * vtextCom gateway
 * @note Previously number@vzwpix.com for MMS but reported no longer working (2017)
 */
export const vtextCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@vtext.com`,
});

/**
 * zsendCom gateway
 */
export const zsendCom: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: `${to.nationalNumber}@zsend.com`,
});
