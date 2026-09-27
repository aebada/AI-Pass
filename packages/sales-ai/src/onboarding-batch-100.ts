import type { Campaign, Contact, EmailDraft, Lead } from './types.js';
import { DEMO_TENANT_ID } from './demo-data.js';

export interface OnboardingProspect {
  slug: string;
  company: string;
  industry: string;
  companySize: string;
  website: string;
  country: string;
  personaTitle: string;
  personaName: string;
  /** Role inbox or public contact path — research before send. */
  emailHint: string;
  score: number;
  wedge: string;
}

/**
 * 100 regulated-industry ICP prospects for AI-Pass customer onboarding.
 * Focus: DACH / EU banks, insurers, healthcare, public sector — Explaino-class buyers.
 */
export const ONBOARDING_BATCH_100: OnboardingProspect[] = [
  // Banking & financial services (1–30)
  { slug: 'sparkasse-koelnbonn', company: 'Sparkasse KölnBonn', industry: 'Banking', companySize: '5000+', website: 'https://www.sparkasse-koelnbonn.de', country: 'DE', personaTitle: 'Chief Digital Officer', personaName: 'Digital Office', emailHint: 'innovation@sparkasse-koelnbonn.de', score: 92, wedge: 'Governed AI for branch knowledge & compliance' },
  { slug: 'sparkasse-muenchen', company: 'Stadtsparkasse München', industry: 'Banking', companySize: '2000+', website: 'https://www.sskm.de', country: 'DE', personaTitle: 'Head of IT Strategy', personaName: 'IT Strategy', emailHint: 'digitalisierung@sskm.de', score: 90, wedge: 'Knowledge → agent workflows under audit' },
  { slug: 'sparkasse-hannover', company: 'Sparkasse Hannover', industry: 'Banking', companySize: '2000+', website: 'https://www.sparkasse-hannover.de', country: 'DE', personaTitle: 'CISO', personaName: 'Information Security', emailHint: 'sicherheit@sparkasse-hannover.de', score: 88, wedge: 'Trust Engine for AI systems in banking' },
  { slug: 'deutsche-bank', company: 'Deutsche Bank', industry: 'Banking', companySize: '50000+', website: 'https://www.db.com', country: 'DE', personaTitle: 'Head of AI Governance', personaName: 'AI Governance', emailHint: 'ai-governance@db.com', score: 95, wedge: 'Enterprise AI OS with residency & SSO' },
  { slug: 'commerzbank', company: 'Commerzbank', industry: 'Banking', companySize: '40000+', website: 'https://www.commerzbank.de', country: 'DE', personaTitle: 'Head of Digital Transformation', personaName: 'Digital Transformation', emailHint: 'innovation@commerzbank.com', score: 93, wedge: 'Governed copilots for ops & compliance' },
  { slug: 'dz-bank', company: 'DZ BANK', industry: 'Banking', companySize: '5000+', website: 'https://www.dzbank.de', country: 'DE', personaTitle: 'Chief Data Officer', personaName: 'Data Office', emailHint: 'data-office@dzbank.de', score: 91, wedge: 'Knowledge pipeline for regulated AI' },
  { slug: 'kfw', company: 'KfW Bankengruppe', industry: 'Banking', companySize: '5000+', website: 'https://www.kfw.de', country: 'DE', personaTitle: 'Head of Innovation', personaName: 'Innovation', emailHint: 'innovation@kfw.de', score: 89, wedge: 'Policy-aware AI for public finance' },
  { slug: 'lbbw', company: 'LBBW', industry: 'Banking', companySize: '10000+', website: 'https://www.lbbw.de', country: 'DE', personaTitle: 'CTO', personaName: 'Technology', emailHint: 'innovation@lbbw.de', score: 88, wedge: 'Multi-model routing under bank policy' },
  { slug: 'bayernlb', company: 'BayernLB', industry: 'Banking', companySize: '5000+', website: 'https://www.bayernlb.de', country: 'DE', personaTitle: 'Head of Compliance Tech', personaName: 'Compliance Tech', emailHint: 'compliance-tech@bayernlb.de', score: 87, wedge: 'Compliance AI + trust certification' },
  { slug: 'helaba', company: 'Helaba', industry: 'Banking', companySize: '5000+', website: 'https://www.helaba.com', country: 'DE', personaTitle: 'CDO', personaName: 'Digital Office', emailHint: 'digital@helaba.de', score: 86, wedge: 'Governed knowledge for treasury ops' },
  { slug: 'ing-diba', company: 'ING Deutschland', industry: 'Banking', companySize: '5000+', website: 'https://www.ing.de', country: 'DE', personaTitle: 'Head of AI', personaName: 'AI Team', emailHint: 'ai@ing.de', score: 90, wedge: 'Agent studio with audit trails' },
  { slug: 'n26', company: 'N26', industry: 'Banking', companySize: '1000+', website: 'https://n26.com', country: 'DE', personaTitle: 'Head of Risk & Compliance', personaName: 'Risk & Compliance', emailHint: 'compliance@n26.com', score: 84, wedge: 'Fast AI with bank-grade controls' },
  { slug: 'traderepublic', company: 'Trade Republic', industry: 'Fintech', companySize: '1000+', website: 'https://traderepublic.com', country: 'DE', personaTitle: 'Head of Platform', personaName: 'Platform', emailHint: 'platform@traderepublic.com', score: 82, wedge: 'Trust-scored AI features for retail' },
  { slug: 'solaris', company: 'Solaris SE', industry: 'Banking', companySize: '500+', website: 'https://www.solarisgroup.com', country: 'DE', personaTitle: 'CISO', personaName: 'Security', emailHint: 'security@solarisgroup.com', score: 85, wedge: 'BaaS AI under BaFin-ready governance' },
  { slug: 'raisin', company: 'Raisin', industry: 'Fintech', companySize: '500+', website: 'https://www.raisin.com', country: 'DE', personaTitle: 'VP Engineering', personaName: 'Engineering', emailHint: 'partnerships@raisin.com', score: 80, wedge: 'Knowledge OS for partner banks' },
  { slug: 'unicredit-de', company: 'UniCredit Bank GmbH (HVB)', industry: 'Banking', companySize: '10000+', website: 'https://www.hypovereinsbank.de', country: 'DE', personaTitle: 'Head of Data & AI', personaName: 'Data & AI', emailHint: 'data-ai@unicredit.de', score: 88, wedge: 'Enterprise AI workspace for banking' },
  { slug: 'postbank', company: 'Postbank / Deutsche Bank', industry: 'Banking', companySize: '10000+', website: 'https://www.postbank.de', country: 'DE', personaTitle: 'Head of Customer Ops', personaName: 'Customer Ops', emailHint: 'innovation@postbank.de', score: 83, wedge: 'Support AI with PII masking layer' },
  { slug: 'targobank', company: 'Targobank', industry: 'Banking', companySize: '5000+', website: 'https://www.targobank.de', country: 'DE', personaTitle: 'CIO', personaName: 'IT', emailHint: 'cio-office@targobank.de', score: 81, wedge: 'Governed forms + agent intake' },
  { slug: 'consorsbank', company: 'Consorsbank', industry: 'Banking', companySize: '1000+', website: 'https://www.consorsbank.de', country: 'DE', personaTitle: 'Head of Digital', personaName: 'Digital', emailHint: 'digital@consorsbank.de', score: 79, wedge: 'Knowledge copilots for advisors' },
  { slug: 'comdirect', company: 'comdirect', industry: 'Banking', companySize: '1000+', website: 'https://www.comdirect.de', country: 'DE', personaTitle: 'Product Lead AI', personaName: 'Product AI', emailHint: 'product@comdirect.de', score: 78, wedge: 'Trust-certified customer AI features' },
  { slug: 'erste-group', company: 'Erste Group', industry: 'Banking', companySize: '45000+', website: 'https://www.erstegroup.com', country: 'AT', personaTitle: 'Group Head of AI', personaName: 'Group AI', emailHint: 'ai@erstegroup.com', score: 91, wedge: 'Multi-country AI OS for banking' },
  { slug: 'raiffeisen-at', company: 'Raiffeisen Bank International', industry: 'Banking', companySize: '40000+', website: 'https://www.rbinternational.com', country: 'AT', personaTitle: 'CISO', personaName: 'Security', emailHint: 'security@rbinternational.com', score: 89, wedge: 'Policy routing across CEE banks' },
  { slug: 'ubs', company: 'UBS', industry: 'Banking', companySize: '70000+', website: 'https://www.ubs.com', country: 'CH', personaTitle: 'Head of AI Risk', personaName: 'AI Risk', emailHint: 'ai-risk@ubs.com', score: 94, wedge: 'Wealth AI under Swiss/EU controls' },
  { slug: 'credit-suisse-ubs', company: 'UBS (ex Credit Suisse book)', industry: 'Banking', companySize: '70000+', website: 'https://www.ubs.com', country: 'CH', personaTitle: 'Integration AI Lead', personaName: 'Integration', emailHint: 'integration-ai@ubs.com', score: 86, wedge: 'Knowledge merge + governed agents' },
  { slug: 'julius-baer', company: 'Julius Baer', industry: 'Banking', companySize: '6000+', website: 'https://www.juliusbaer.com', country: 'CH', personaTitle: 'CTO', personaName: 'Technology', emailHint: 'innovation@juliusbaer.com', score: 85, wedge: 'Private banking knowledge OS' },
  { slug: 'pictet', company: 'Pictet Group', industry: 'Banking', companySize: '5000+', website: 'https://www.pictet.com', country: 'CH', personaTitle: 'Head of Digital', personaName: 'Digital', emailHint: 'digital@pictet.com', score: 84, wedge: 'Secure AI for wealth ops' },
  { slug: 'bnp-paribas-de', company: 'BNP Paribas Deutschland', industry: 'Banking', companySize: '5000+', website: 'https://www.bnpparibas.de', country: 'DE', personaTitle: 'Head of Innovation', personaName: 'Innovation', emailHint: 'innovation@bnpparibas.de', score: 87, wedge: 'EU banking AI control plane' },
  { slug: 'societe-generale-de', company: 'Société Générale Germany', industry: 'Banking', companySize: '2000+', website: 'https://www.societegenerale.de', country: 'DE', personaTitle: 'CDO', personaName: 'Digital', emailHint: 'digital@societegenerale.de', score: 83, wedge: 'Markets knowledge + trust scores' },
  { slug: 'santander-de', company: 'Santander Consumer Bank', industry: 'Banking', companySize: '5000+', website: 'https://www.santander.de', country: 'DE', personaTitle: 'Head of Risk Tech', personaName: 'Risk Tech', emailHint: 'risk-tech@santander.de', score: 82, wedge: 'Lending AI with audit & masking' },
  { slug: 'volkswagen-bank', company: 'Volkswagen Bank', industry: 'Banking', companySize: '2000+', website: 'https://www.vwbank.de', country: 'DE', personaTitle: 'CIO', personaName: 'IT', emailHint: 'innovation@vwbank.de', score: 81, wedge: 'Captive finance AI governance' },

  // Insurance (31–55)
  { slug: 'allianz', company: 'Allianz SE', industry: 'Insurance', companySize: '150000+', website: 'https://www.allianz.com', country: 'DE', personaTitle: 'Global Head of AI', personaName: 'AI Office', emailHint: 'ai-office@allianz.com', score: 96, wedge: 'Claims & knowledge under Trust Engine' },
  { slug: 'munich-re', company: 'Munich Re', industry: 'Insurance', companySize: '40000+', website: 'https://www.munichre.com', country: 'DE', personaTitle: 'Head of AI & Analytics', personaName: 'AI & Analytics', emailHint: 'ai@munichre.com', score: 95, wedge: 'Reinsurance knowledge OS + agents' },
  { slug: 'vkb', company: 'Versicherungskammer Bayern', industry: 'Insurance', companySize: '5000+', website: 'https://www.vkb.de', country: 'DE', personaTitle: 'CDO', personaName: 'Digitalization', emailHint: 'digitalisierung@vkb.de', score: 93, wedge: 'Explaino-class knowledge + governed AI' },
  { slug: 'ergo', company: 'ERGO Group', industry: 'Insurance', companySize: '40000+', website: 'https://www.ergo.com', country: 'DE', personaTitle: 'Head of Data Science', personaName: 'Data Science', emailHint: 'data-science@ergo.de', score: 91, wedge: 'Agent workflows for claims ops' },
  { slug: 'generali-de', company: 'Generali Deutschland', industry: 'Insurance', companySize: '10000+', website: 'https://www.generali.de', country: 'DE', personaTitle: 'CIO', personaName: 'IT', emailHint: 'innovation@generali.de', score: 89, wedge: 'Policy knowledge copilots' },
  { slug: 'axa-de', company: 'AXA Konzern AG', industry: 'Insurance', companySize: '10000+', website: 'https://www.axa.de', country: 'DE', personaTitle: 'Head of Innovation', personaName: 'Innovation', emailHint: 'innovation@axa.de', score: 88, wedge: 'Governed intake + trust packs' },
  { slug: 'huk-coburg', company: 'HUK-COBURG', industry: 'Insurance', companySize: '10000+', website: 'https://www.huk.de', country: 'DE', personaTitle: 'Head of IT', personaName: 'IT', emailHint: 'digital@huk.de', score: 87, wedge: 'High-volume claims AI control' },
  { slug: 'debeka', company: 'Debeka', industry: 'Insurance', companySize: '16000+', website: 'https://www.debeka.de', country: 'DE', personaTitle: 'CDO', personaName: 'Digital', emailHint: 'digital@debeka.de', score: 86, wedge: 'Member knowledge under GDPR' },
  { slug: 'signal-iduna', company: 'Signal Iduna', industry: 'Insurance', companySize: '10000+', website: 'https://www.signal-iduna.de', country: 'DE', personaTitle: 'Head of Digital Products', personaName: 'Digital Products', emailHint: 'digital@signal-iduna.de', score: 85, wedge: 'Product ops AI with audit' },
  { slug: 'gothaer', company: 'Gothaer', industry: 'Insurance', companySize: '5000+', website: 'https://www.gothaer.de', country: 'DE', personaTitle: 'CTO', personaName: 'Technology', emailHint: 'innovation@gothaer.de', score: 84, wedge: 'Underwriting knowledge agents' },
  { slug: 'wurttembergische', company: 'Württembergische Versicherung', industry: 'Insurance', companySize: '5000+', website: 'https://www.wuerttembergische.de', country: 'DE', personaTitle: 'Head of Transformation', personaName: 'Transformation', emailHint: 'transformation@wuerttembergische.de', score: 83, wedge: 'Advisor copilots + masking' },
  { slug: 'ruv', company: 'R+V Versicherung', industry: 'Insurance', companySize: '15000+', website: 'https://www.ruv.de', country: 'DE', personaTitle: 'CISO', personaName: 'Security', emailHint: 'sicherheit@ruv.de', score: 86, wedge: 'Coop banking insurance AI OS' },
  { slug: 'continentale', company: 'Continentale', industry: 'Insurance', companySize: '3000+', website: 'https://www.continentale.de', country: 'DE', personaTitle: 'Head of IT', personaName: 'IT', emailHint: 'it-innovation@continentale.de', score: 80, wedge: 'Claims knowledge governance' },
  { slug: 'barmenia', company: 'Barmenia', industry: 'Insurance', companySize: '3000+', website: 'https://www.barmenia.de', country: 'DE', personaTitle: 'CDO', personaName: 'Digital', emailHint: 'digital@barmenia.de', score: 79, wedge: 'Health insurance AI controls' },
  { slug: 'sdk', company: 'Süddeutsche Krankenversicherung', industry: 'Insurance', companySize: '1000+', website: 'https://www.sdk.de', country: 'DE', personaTitle: 'Head of Digital', personaName: 'Digital', emailHint: 'digital@sdk.de', score: 78, wedge: 'Member service agents + trust' },
  { slug: 'swiss-re', company: 'Swiss Re', industry: 'Insurance', companySize: '14000+', website: 'https://www.swissre.com', country: 'CH', personaTitle: 'Head of AI', personaName: 'AI', emailHint: 'ai@swissre.com', score: 94, wedge: 'Reinsurance analytics under OS' },
  { slug: 'zurich-ins', company: 'Zurich Insurance', industry: 'Insurance', companySize: '55000+', website: 'https://www.zurich.com', country: 'CH', personaTitle: 'Group AI Lead', personaName: 'Group AI', emailHint: 'ai@zurich.com', score: 93, wedge: 'Global AI with local residency' },
  { slug: 'swiss-life', company: 'Swiss Life', industry: 'Insurance', companySize: '10000+', website: 'https://www.swisslife.com', country: 'CH', personaTitle: 'CTO', personaName: 'Technology', emailHint: 'innovation@swisslife.com', score: 85, wedge: 'Life ops knowledge platform' },
  { slug: 'helvetia', company: 'Helvetia', industry: 'Insurance', companySize: '12000+', website: 'https://www.helvetia.com', country: 'CH', personaTitle: 'Head of Data', personaName: 'Data', emailHint: 'data@helvetia.com', score: 84, wedge: 'Multi-country policy AI' },
  { slug: 'uniqa', company: 'UNIQA Insurance Group', industry: 'Insurance', companySize: '20000+', website: 'https://www.uniqagroup.com', country: 'AT', personaTitle: 'CDO', personaName: 'Digital', emailHint: 'digital@uniqa.at', score: 86, wedge: 'CEE insurance AI OS' },
  { slug: 'vienna-insurance', company: 'Vienna Insurance Group', industry: 'Insurance', companySize: '25000+', website: 'https://www.vig.com', country: 'AT', personaTitle: 'Head of Innovation', personaName: 'Innovation', emailHint: 'innovation@vig.com', score: 85, wedge: 'Group knowledge + agents' },
  { slug: 'talanx', company: 'Talanx', industry: 'Insurance', companySize: '25000+', website: 'https://www.talanx.com', country: 'DE', personaTitle: 'Head of AI', personaName: 'AI', emailHint: 'ai@talanx.com', score: 88, wedge: 'Industrial lines AI governance' },
  { slug: 'hannover-re', company: 'Hannover Re', industry: 'Insurance', companySize: '3000+', website: 'https://www.hannover-re.com', country: 'DE', personaTitle: 'Chief Data Officer', personaName: 'Data Office', emailHint: 'data@hannover-re.com', score: 90, wedge: 'Reinsurance knowledge graph + OS' },
  { slug: 'wuestenrot', company: 'Wüstenrot & Württembergische', industry: 'Insurance', companySize: '10000+', website: 'https://www.ww-ag.com', country: 'DE', personaTitle: 'CIO', personaName: 'IT', emailHint: 'innovation@ww-ag.com', score: 82, wedge: 'Bancassurance AI control plane' },
  { slug: 'lv-1871', company: 'Lebensversicherung von 1871', industry: 'Insurance', companySize: '1000+', website: 'https://www.lv1871.de', country: 'DE', personaTitle: 'Head of Digital', personaName: 'Digital', emailHint: 'digital@lv1871.de', score: 77, wedge: 'Life product knowledge agents' },

  // Healthcare (56–75)
  { slug: 'aok-bw', company: 'AOK Baden-Württemberg', industry: 'Healthcare', companySize: '10000+', website: 'https://www.aok.de/bw', country: 'DE', personaTitle: 'CDO', personaName: 'Digitalization', emailHint: 'digitalisierung@bw.aok.de', score: 94, wedge: 'Member knowledge + governed AI' },
  { slug: 'aok-bayern', company: 'AOK Bayern', industry: 'Healthcare', companySize: '10000+', website: 'https://www.aok.de/bayern', country: 'DE', personaTitle: 'Head of IT', personaName: 'IT', emailHint: 'innovation@by.aok.de', score: 91, wedge: 'Care pathways under Trust Engine' },
  { slug: 'aok-nordost', company: 'AOK Nordost', industry: 'Healthcare', companySize: '5000+', website: 'https://www.aok.de/nordost', country: 'DE', personaTitle: 'Head of Digital Health', personaName: 'Digital Health', emailHint: 'digital@nordost.aok.de', score: 88, wedge: 'Health knowledge OS + masking' },
  { slug: 'tk', company: 'Techniker Krankenkasse', industry: 'Healthcare', companySize: '14000+', website: 'https://www.tk.de', country: 'DE', personaTitle: 'Head of AI', personaName: 'AI', emailHint: 'ai@tk.de', score: 93, wedge: 'Member copilots with GDPR controls' },
  { slug: 'barmer', company: 'Barmer', industry: 'Healthcare', companySize: '15000+', website: 'https://www.barmer.de', country: 'DE', personaTitle: 'CDO', personaName: 'Digital', emailHint: 'digital@barmer.de', score: 92, wedge: 'Claims & care AI governance' },
  { slug: 'dak', company: 'DAK-Gesundheit', industry: 'Healthcare', companySize: '10000+', website: 'https://www.dak.de', country: 'DE', personaTitle: 'CIO', personaName: 'IT', emailHint: 'innovation@dak.de', score: 87, wedge: 'Insured knowledge under audit' },
  { slug: 'ikk-classic', company: 'IKK classic', industry: 'Healthcare', companySize: '5000+', website: 'https://www.ikk-classic.de', country: 'DE', personaTitle: 'Head of Digital', personaName: 'Digital', emailHint: 'digital@ikk-classic.de', score: 84, wedge: 'Service agents + trust packs' },
  { slug: 'helios', company: 'Helios Kliniken', industry: 'Healthcare', companySize: '70000+', website: 'https://www.helios-gesundheit.de', country: 'DE', personaTitle: 'Chief Medical Informatics', personaName: 'Medical IT', emailHint: 'innovation@helios-gesundheit.de', score: 90, wedge: 'Clinical knowledge with residency' },
  { slug: 'asklepios', company: 'Asklepios Kliniken', industry: 'Healthcare', companySize: '60000+', website: 'https://www.asklepios.com', country: 'DE', personaTitle: 'CDO', personaName: 'Digital', emailHint: 'digital@asklepios.com', score: 88, wedge: 'Hospital AI OS + compliance' },
  { slug: 'rhon', company: 'Rhön-Klinikum', industry: 'Healthcare', companySize: '15000+', website: 'https://www.rhoen-klinikum-ag.com', country: 'DE', personaTitle: 'CIO', personaName: 'IT', emailHint: 'it@rhoen-klinikum-ag.com', score: 85, wedge: 'Care pathway agents' },
  { slug: 'charite', company: 'Charité – Universitätsmedizin Berlin', industry: 'Healthcare', companySize: '18000+', website: 'https://www.charite.de', country: 'DE', personaTitle: 'Head of Digital Medicine', personaName: 'Digital Medicine', emailHint: 'digital-medicine@charite.de', score: 91, wedge: 'Research knowledge + governed AI' },
  { slug: 'mri', company: 'Klinikum rechts der Isar (TUM)', industry: 'Healthcare', companySize: '5000+', website: 'https://www.mri.tum.de', country: 'DE', personaTitle: 'CIO', personaName: 'IT', emailHint: 'cio@mri.tum.de', score: 86, wedge: 'Academic hospital AI controls' },
  { slug: 'uniklinik-koeln', company: 'Uniklinik Köln', industry: 'Healthcare', companySize: '10000+', website: 'https://www.uk-koeln.de', country: 'DE', personaTitle: 'CDO', personaName: 'Digital', emailHint: 'digitalisierung@uk-koeln.de', score: 85, wedge: 'Clinical docs → trusted agents' },
  { slug: 'fresenius', company: 'Fresenius', industry: 'Healthcare', companySize: '300000+', website: 'https://www.fresenius.com', country: 'DE', personaTitle: 'Group Head of AI', personaName: 'Group AI', emailHint: 'ai@fresenius.com', score: 92, wedge: 'Medtech + care AI OS' },
  { slug: 'siemens-healthineers', company: 'Siemens Healthineers', industry: 'Healthcare', companySize: '70000+', website: 'https://www.siemens-healthineers.com', country: 'DE', personaTitle: 'Head of Digital Ecosystem', personaName: 'Digital Ecosystem', emailHint: 'digital-ecosystem@siemens-healthineers.com', score: 93, wedge: 'Device knowledge + enterprise AI' },
  { slug: 'biontech', company: 'BioNTech', industry: 'Healthcare', companySize: '5000+', website: 'https://www.biontech.com', country: 'DE', personaTitle: 'Head of IT / Digital', personaName: 'IT Digital', emailHint: 'digital@biontech.de', score: 87, wedge: 'R&D knowledge under governance' },
  { slug: 'merck-kgaa', company: 'Merck KGaA', industry: 'Healthcare', companySize: '60000+', website: 'https://www.merckgroup.com', country: 'DE', personaTitle: 'Chief Digital Officer', personaName: 'Digital Office', emailHint: 'digital@merckgroup.com', score: 90, wedge: 'Life science AI control plane' },
  { slug: 'bayer', company: 'Bayer', industry: 'Healthcare', companySize: '90000+', website: 'https://www.bayer.com', country: 'DE', personaTitle: 'Head of AI Ethics & Governance', personaName: 'AI Ethics', emailHint: 'ai-governance@bayer.com', score: 91, wedge: 'Pharma AI with Trust Engine' },
  { slug: 'roche-de', company: 'Roche Deutschland', industry: 'Healthcare', companySize: '15000+', website: 'https://www.roche.de', country: 'DE', personaTitle: 'Digital Health Lead', personaName: 'Digital Health', emailHint: 'digital-health@roche.com', score: 89, wedge: 'Diagnostics knowledge OS' },
  { slug: 'novartis-de', company: 'Novartis Deutschland', industry: 'Healthcare', companySize: '10000+', website: 'https://www.novartis.de', country: 'DE', personaTitle: 'Head of Data & AI', personaName: 'Data & AI', emailHint: 'data-ai@novartis.com', score: 88, wedge: 'Medical affairs AI under policy' },

  // Public sector, energy, telecom, industry (76–100)
  { slug: 'bundesagentur-arbeit', company: 'Bundesagentur für Arbeit', industry: 'Public Sector', companySize: '100000+', website: 'https://www.arbeitsagentur.de', country: 'DE', personaTitle: 'Chief Digital Officer', personaName: 'Digital Office', emailHint: 'digitalisierung@arbeitsagentur.de', score: 90, wedge: 'Citizen services AI with audit' },
  { slug: 'deutsche-rente', company: 'Deutsche Rentenversicherung Bund', industry: 'Public Sector', companySize: '20000+', website: 'https://www.deutsche-rentenversicherung.de', country: 'DE', personaTitle: 'Head of IT', personaName: 'IT', emailHint: 'innovation@drv-bund.de', score: 87, wedge: 'Benefits knowledge under OS' },
  { slug: 'itzbund', company: 'ITZBund', industry: 'Public Sector', companySize: '10000+', website: 'https://www.itzbund.de', country: 'DE', personaTitle: 'Head of AI Projects', personaName: 'AI Projects', emailHint: 'ai@itzbund.de', score: 92, wedge: 'Federal AI platform governance' },
  { slug: 'bwi', company: 'BWI GmbH', industry: 'Defence / Public', companySize: '7000+', website: 'https://www.bwi.de', country: 'DE', personaTitle: 'Head of Innovation', personaName: 'Innovation', emailHint: 'innovation@bwi.de', score: 91, wedge: 'Air-gapped / private-cloud AI OS' },
  { slug: 'bundeswehr-cir', company: 'Bundeswehr CIR', industry: 'Defence', companySize: '5000+', website: 'https://www.bundeswehr.de', country: 'DE', personaTitle: 'Digitalization Lead', personaName: 'Digitalization', emailHint: 'digitalisierung@bundeswehr.org', score: 89, wedge: 'Sovereign AI with trust packs' },
  { slug: 'deutsche-telekom', company: 'Deutsche Telekom', industry: 'Telecom', companySize: '200000+', website: 'https://www.telekom.com', country: 'DE', personaTitle: 'Head of AI Governance', personaName: 'AI Governance', emailHint: 'ai-governance@telekom.de', score: 94, wedge: 'Telco-scale AI OS + marketplace' },
  { slug: 'vodafone-de', company: 'Vodafone Deutschland', industry: 'Telecom', companySize: '15000+', website: 'https://www.vodafone.de', country: 'DE', personaTitle: 'CDO', personaName: 'Digital', emailHint: 'digital@vodafone.com', score: 88, wedge: 'Customer ops agents + trust' },
  { slug: 'o2-telefonica', company: 'Telefónica Germany (O2)', industry: 'Telecom', companySize: '8000+', website: 'https://www.telefonica.de', country: 'DE', personaTitle: 'Head of AI', personaName: 'AI', emailHint: 'ai@telefonica.com', score: 85, wedge: 'Support AI under governance' },
  { slug: '1und1', company: '1&1', industry: 'Telecom', companySize: '3000+', website: 'https://www.1und1.de', country: 'DE', personaTitle: 'CTO', personaName: 'Technology', emailHint: 'innovation@1und1.de', score: 80, wedge: 'ISP knowledge copilots' },
  { slug: 'eon', company: 'E.ON', industry: 'Energy', companySize: '70000+', website: 'https://www.eon.com', country: 'DE', personaTitle: 'Head of Digital', personaName: 'Digital', emailHint: 'digital@eon.com', score: 90, wedge: 'Grid ops knowledge + agents' },
  { slug: 'rwe', company: 'RWE', industry: 'Energy', companySize: '20000+', website: 'https://www.rwe.com', country: 'DE', personaTitle: 'CDO', personaName: 'Digital Office', emailHint: 'digital@rwe.com', score: 89, wedge: 'Energy trading AI controls' },
  { slug: 'enbw', company: 'EnBW', industry: 'Energy', companySize: '25000+', website: 'https://www.enbw.com', country: 'DE', personaTitle: 'Head of AI', personaName: 'AI', emailHint: 'ai@enbw.com', score: 87, wedge: 'Utility knowledge OS' },
  { slug: 'vattenfall-de', company: 'Vattenfall Germany', industry: 'Energy', companySize: '5000+', website: 'https://www.vattenfall.de', country: 'DE', personaTitle: 'Innovation Lead', personaName: 'Innovation', emailHint: 'innovation@vattenfall.de', score: 84, wedge: 'Customer energy AI governance' },
  { slug: 'siemens', company: 'Siemens AG', industry: 'Industry', companySize: '300000+', website: 'https://www.siemens.com', country: 'DE', personaTitle: 'Head of Industrial AI', personaName: 'Industrial AI', emailHint: 'industrial-ai@siemens.com', score: 95, wedge: 'Factory knowledge + Trust Engine' },
  { slug: 'sap', company: 'SAP', industry: 'Enterprise Software', companySize: '100000+', website: 'https://www.sap.com', country: 'DE', personaTitle: 'Partner AI Alliances', personaName: 'Alliances', emailHint: 'ai-alliances@sap.com', score: 92, wedge: 'Co-sell governed AI OS on SAP' },
  { slug: 'bmw', company: 'BMW Group', industry: 'Automotive', companySize: '150000+', website: 'https://www.bmwgroup.com', country: 'DE', personaTitle: 'Head of AI Governance', personaName: 'AI Governance', emailHint: 'ai-governance@bmwgroup.com', score: 93, wedge: 'Engineering knowledge under OS' },
  { slug: 'mercedes', company: 'Mercedes-Benz Group', industry: 'Automotive', companySize: '170000+', website: 'https://group.mercedes-benz.com', country: 'DE', personaTitle: 'CDO', personaName: 'Digital', emailHint: 'digital@mercedes-benz.com', score: 93, wedge: 'Plant & compliance AI control' },
  { slug: 'volkswagen', company: 'Volkswagen AG', industry: 'Automotive', companySize: '600000+', website: 'https://www.volkswagen-group.com', country: 'DE', personaTitle: 'Group AI Office', personaName: 'Group AI', emailHint: 'ai-office@volkswagen.de', score: 94, wedge: 'Scale AI with trust certification' },
  { slug: 'bosch', company: 'Robert Bosch GmbH', industry: 'Industry', companySize: '400000+', website: 'https://www.bosch.com', country: 'DE', personaTitle: 'Head of AI', personaName: 'AI', emailHint: 'ai@bosch.com', score: 94, wedge: 'Industrial AI OS + marketplace' },
  { slug: 'deutsche-bahn', company: 'Deutsche Bahn', industry: 'Transport', companySize: '300000+', website: 'https://www.deutschebahn.com', country: 'DE', personaTitle: 'CDO', personaName: 'Digital', emailHint: 'digitalisierung@deutschebahn.com', score: 91, wedge: 'Ops knowledge agents + audit' },
  { slug: 'lufthansa', company: 'Lufthansa Group', industry: 'Transport', companySize: '100000+', website: 'https://www.lufthansagroup.com', country: 'DE', personaTitle: 'Head of Digital Ops', personaName: 'Digital Ops', emailHint: 'digital-ops@dlh.de', score: 88, wedge: 'Aviation knowledge under policy' },
  { slug: 'adidas', company: 'adidas', industry: 'Retail', companySize: '50000+', website: 'https://www.adidas-group.com', country: 'DE', personaTitle: 'Head of Enterprise AI', personaName: 'Enterprise AI', emailHint: 'enterprise-ai@adidas.com', score: 86, wedge: 'Brand & ops AI with governance' },
  { slug: 'schwarz-gruppe', company: 'Schwarz Gruppe (Lidl/Kaufland)', industry: 'Retail', companySize: '500000+', website: 'https://gruppe.schwarz', country: 'DE', personaTitle: 'CDO', personaName: 'Digital', emailHint: 'digital@gruppe.schwarz', score: 89, wedge: 'Retail-scale AI control plane' },
  { slug: 'zalando', company: 'Zalando', industry: 'Retail', companySize: '15000+', website: 'https://www.zalando.de', country: 'DE', personaTitle: 'Head of ML Platform', personaName: 'ML Platform', emailHint: 'ml-platform@zalando.de', score: 85, wedge: 'Platform AI + trust & wallet' },
  { slug: 'datev', company: 'DATEV', industry: 'Enterprise Software', companySize: '8000+', website: 'https://www.datev.de', country: 'DE', personaTitle: 'Head of AI Products', personaName: 'AI Products', emailHint: 'ai@datev.de', score: 90, wedge: 'Tax/accounting AI under OS' },
];

export const ONBOARDING_CAMPAIGN_ID = 'campaign_onboard_100';
export const ONBOARDING_BATCH_SOURCE = 'onboarding-batch-100';

export function buildOnboardingContacts(tenantId = DEMO_TENANT_ID): Contact[] {
  const now = new Date().toISOString();
  return ONBOARDING_BATCH_100.map((p, i) => ({
    id: `contact_ob_${String(i + 1).padStart(3, '0')}`,
    tenantId,
    leadId: `lead_ob_${String(i + 1).padStart(3, '0')}`,
    email: p.emailHint,
    name: p.personaName,
    title: p.personaTitle,
    company: p.company,
    createdAt: now,
    metadata: { slug: p.slug, country: p.country, wedge: p.wedge },
  }));
}

export function buildOnboardingLeads(tenantId = DEMO_TENANT_ID): Lead[] {
  const now = new Date().toISOString();
  return ONBOARDING_BATCH_100.map((p, i) => ({
    id: `lead_ob_${String(i + 1).padStart(3, '0')}`,
    tenantId,
    contactId: `contact_ob_${String(i + 1).padStart(3, '0')}`,
    company: p.company,
    industry: p.industry,
    companySize: p.companySize,
    status: 'new' as const,
    score: p.score,
    source: ONBOARDING_BATCH_SOURCE,
    website: p.website,
    notes: `${p.wedge} · ${p.country} · persona: ${p.personaTitle}`,
    assignedTo: 'demo-user',
    createdAt: now,
    updatedAt: now,
  }));
}

export function buildOnboardingCampaign(tenantId = DEMO_TENANT_ID): Campaign {
  const now = new Date().toISOString();
  const leadIds = ONBOARDING_BATCH_100.map((_, i) => `lead_ob_${String(i + 1).padStart(3, '0')}`);
  return {
    id: ONBOARDING_CAMPAIGN_ID,
    tenantId,
    name: 'Onboard 100 — Regulated Enterprise ICP',
    type: 'cold',
    status: 'active',
    leadIds,
    sentCount: 0,
    openRate: 0,
    replyRate: 0,
    creditsUsed: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildOnboardingEmailDrafts(tenantId = DEMO_TENANT_ID): EmailDraft[] {
  const now = new Date().toISOString();
  return ONBOARDING_BATCH_100.map((p, i) => {
    const leadId = `lead_ob_${String(i + 1).padStart(3, '0')}`;
    const contactId = `contact_ob_${String(i + 1).padStart(3, '0')}`;
    return {
      id: `email_ob_${String(i + 1).padStart(3, '0')}`,
      tenantId,
      leadId,
      contactId,
      type: 'cold' as const,
      subject: `${p.company}: governed AI for ${p.industry.toLowerCase()} knowledge`,
      body: `Hi ${p.personaName},

Teams at ${p.company} are under pressure to use AI without losing control of knowledge, audit, or residency.

AI-Pass is the enterprise AI operating system: one workspace for models, agents, knowledge, and Trust Engine certification — built for regulated ${p.industry.toLowerCase()}.

Wedge for you: ${p.wedge}.

Would you be open to a 20-minute onboarding call this week to map one pilot use case?

Best regards,
AI-Pass Partnerships (a HOPn company)
https://aipass.space
contact@ehopn.com`,
      personalization: {
        company: p.company,
        industry: p.industry,
        wedge: p.wedge,
        website: p.website,
      },
      confidence: 0.82,
      creditsUsed: 0,
      createdAt: now,
    };
  });
}

export function onboardingBatchToCsv(): string {
  const header = [
    'company',
    'industry',
    'country',
    'size',
    'website',
    'persona_title',
    'persona_name',
    'email_hint',
    'score',
    'wedge',
    'subject',
  ];
  const drafts = buildOnboardingEmailDrafts();
  const rows = ONBOARDING_BATCH_100.map((p, i) => {
    const subject = drafts[i]?.subject ?? '';
    return [
      p.company,
      p.industry,
      p.country,
      p.companySize,
      p.website,
      p.personaTitle,
      p.personaName,
      p.emailHint,
      String(p.score),
      p.wedge,
      subject,
    ]
      .map((c) => `"${String(c).replace(/"/g, '""')}"`)
      .join(',');
  });
  return [header.join(','), ...rows].join('\n');
}
