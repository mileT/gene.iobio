//
// URLS
//
var stage_iobio_services      = "nv-green.iobio.io/";
var dev_iobio_services        = "nv-dev-new.iobio.io/";
var prod_iobio_services       = "nv-prod.iobio.io/";

var new_iobio_services        = isOffline              ? serverInstance : stage_iobio_services;
var iobio_http_services       = "http://" + (isOffline ? serverInstance : stage_iobio_services);


// http services
var geneInfoServer            = iobio_http_services + "geneinfo/";
var geneToPhenoServer         = iobio_http_services + "gene2pheno/";
var hpoServer                 = iobio_http_services + "hpo/";
var phenolyzerServer          = "https://7z68tjgpw4.execute-api.us-east-1.amazonaws.com/dev/phenolyzer/";
var phenolyzerOnlyServer      = iobio_http_services + "phenolyzer/";

// email service
var emailServer               = "ws://" +   new_iobio_services + "email/";

// iobio services
var IOBIO = {};
IOBIO.tabix                   = new_iobio_services + (useOnDemand ? "od_tabix/" : "tabix/");
IOBIO.vcfReadDepther          = new_iobio_services  + "vcfdepther/";
IOBIO.snpEff                  = new_iobio_services  + "snpeff/";
IOBIO.vt                      = new_iobio_services  + "vt/";
IOBIO.af                      = new_iobio_services  + "af/";
IOBIO.vep                     = new_iobio_services  + "vep/";
IOBIO.contigAppender          = new_iobio_services  + "ctgapndr/";
IOBIO.bcftools                = new_iobio_services  + "bcftools/";
IOBIO.coverage                = new_iobio_services + "coverage/ ";
IOBIO.samtools                = new_iobio_services +  "samtools/";
IOBIO.samtoolsOnDemand        = new_iobio_services + (useOnDemand ? "od_samtools/" : "samtools/");
IOBIO.freebayes               = new_iobio_services + "freebayes/";
IOBIO.vcflib                  = new_iobio_services + "vcflib/";


// URL for Phenolyzer
var OFFLINE_PHENOLYZER_CACHE_URL  = isOffline ?  (serverCacheDir) : ("../" + serverCacheDir);

// Url for offline Clinvar URL
var OFFLINE_CLINVAR_VCF_URL       = isOffline ?  ("http://" + serverInstance + serverCacheDir + "clinvar.vcf.gz") : "https://s3.amazonaws.com/iobio/gene/clinvar/clinvar.vcf.gz";

var NCBI_GENE_SEARCH_URL          = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gene&usehistory=y&retmode=json";
var NCBI_GENE_SUMMARY_URL         = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&usehistory=y&retmode=json"; 
//
//  EDUCATIONAL / EXHIBIT
//

/*
* These variables control special behavior for running gene.iobio education edition, with
* a simplified interface and logic.  For running one of the special educational edition 
* tours (e.g. a guided tour of the gene.iobio app), turn on both isLevelEdu and isLevelEduTour.
*/
var hideNextButtonAnim      = false;  // is next button hidden on animations during edu tour?
var hasTimeout              = false; // is a timeout based on n seconds of inactivity used?
var keepLocalStorage        = false; // maintain cache between sessions?


// Exhibit URLs
var EXHIBIT_URL             = 'exhibit.html';
var EXHIBIT_URL1            = 'exhibit-case-complete.html';
var EXHIBIT_URL2            = 'exhibit-cases-complete.html';


var eduTourNumber           = "0";
var eduTourShowPhenolyzer   = [true, false];

var EDU_TOUR_VARIANT_SIZE   = 16;

var levelEduImpact = {
	HIGH:      'Harmful',
	MODERATE:  'Probably harmful',
	MODIFIER:  'Probably benign',
	LOW:       'Benign'
}

//
// For the exhibit version, we will restart to the welcome page after n seconds of inactivity
//
var IDLE_INTERVAL    = 3000;  // (in milliseconds) Check for inactivity every 5 seconds 
var MAX_IDLE         = 60;    // After 3 minute (e.g. 3 * 60  = 180 seconds), prompt the user about inactivity
var IDLE_RESTART     = 10000; // (in milliseconds) Automatically restart app in no prompt action taken after 10 seconds
var idleTime         = 0;
var idlePrompting    = false;  // prompt user to continue or just automatically restart session?



