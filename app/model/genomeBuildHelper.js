function GenomeBuildHelper() {
	this.currentSpecies = null;
	this.currentBuild = null;
	this.speciesList = [];
	this.speciesNameToSpecies = {}; // map species name to the species object
	this.speciesToBuilds = {};      // map species to its genome builds
	this.buildNameToBuild = {};     // 

	this.DEFAULT_SPECIES = "Human";
	this.DEFAULT_BUILD   = "GRCh37";

	this.RESOURCE_CLINVAR_VCF_S3      = "CLINVAR VCF S3";
	this.RESOURCE_CLINVAR_VCF_OFFLINE = "CLINVAR VCF OFFLINE";
	this.RESOURCE_CLINVAR_POSITION    = "CLINVAR EUTILS BASE POSITION";

}

GenomeBuildHelper.prototype.promiseInit = function() {
	var me = this;
	return new Promise(function(resolve, reject) {

		$.ajax({
	        url: genomeBuildServer,
	        jsonp: "callback",
			type: "GET",
			dataType: "jsonp",
	        error: function( xhr, status, errorThrown ) {
			        
			        console.log( "Error: " + errorThrown );
			        console.log( "Status: " + status );
			        console.log( xhr );
			        reject("An error occurred when loading genomebuild data: " + errorThrown);
			},
	        success: function(allSpecies) {
	        	
	        	allSpecies.forEach(function(species) {
	        		// Map the species latin name to its species object
	        		me.speciesNameToSpecies[species.name] = species;

	        		// Collect all species into a list to use for dropdown
	        		me.speciesList.push({name: species.name, value: species.name});

	        		species.genomeBuilds.forEach(function(genomeBuild) {

	        			// Map the build name to its build object
	        			me.buildNameToBuild[genomeBuild.name] = genomeBuild;

	        			// Map the species to its genome builds
	        			var builds = me.speciesToBuilds[species.name];
	        			if (builds == null) {
	        				builds = [];
	        				me.speciesToBuilds[species.name] = builds;
	        			}
	        			builds.push(genomeBuild);
	        		
	        		})
	        	});

	        	// Default the species and build
	        	if (me.currentSpecies == null) {
	        		me.currentSpecies = me.speciesNameToSpecies[me.DEFAULT_SPECIES];
	        	}
	        	if (me.currentBuild == null) {
	        		me.currentBuild = me.buildNameToBuild[me.DEFAULT_BUILD];
	        	}

	        	resolve();
	        }
	    });

	});

}
GenomeBuildHelper.prototype.setCurrentSpecies = function(speciesName) {
	this.currentSpecies = this.speciesNameToSpecies[speciesName];
}

GenomeBuildHelper.prototype.setCurrentBuild = function(buildName) {
	this.currentBuild = this.buildNameToBuild[buildName];
}


GenomeBuildHelper.prototype.getCurrentSpeciesName = function() {
	return this.currentSpecies ? this.currentSpecies.name : null;
}

GenomeBuildHelper.prototype.getCurrentSpeciesLatinName = function() {
	return this.currentSpecies ? this.currentSpecies.latin_name : null;
}

GenomeBuildHelper.prototype.getCurrentBuildName = function() {
	return this.currentBuild ? this.currentBuild.name : null;
}

GenomeBuildHelper.prototype.getFastaPath = function(ref) {
	var fastaPath = null;
	if (this.currentBuild) {
		this.currentBuild.references.forEach(function(theReference) {
			if (!fastaPath) {
				if (theReference.name == ref || theReference.alias == ref) {
					if (ref.indexOf('chr') == 0) {
						fastaPath = theReference.fastaPathUCSC;
					} else {
						fastaPath = theReference.fastaPathEnsembl;
					}
				}
			}
		});
	}
	return fastaPath;
}

GenomeBuildHelper.prototype.getBuildAlias = function(aliasType) {
	var theAlias = null;
	if (this.currentBuild) {
		this.currentBuild.aliases.forEach(function(gbAlias) {
			if (!theAlias && gbAlias.type == aliasType) {
				theAlias = gbAlias.alias;
			}
		});
	}
	return theAlias;
}

GenomeBuildHelper.prototype.getBuildResource = function(resourceType) {
	var theResource = null;
	if (this.currentBuild) {
		this.currentBuild.resources.forEach(function(gbResource) {
			if (!theResource && gbResource.type == resourceType) {
				theResource = gbResource.resource;
			}
		});
	}
	return theResource;
}


/*
	Returns an array of all of the genome builds that could be determined
	from bam and vcf headers.  In the correct case, only one (or zero)
	row will be present in the returned array, representing the build that
	is specified in all of the files:
		[{species: the_species_object, build: the_build_object, from: [all bam and vcf files specified as proband,bam]}]
	In cases where different builds have been specified, more than one row is 
	returned: 
		[{species: (Human), build: (build GRCh37), from: [{type:vcf, relationship: mother}, {type:bam, relationship: mother}]}]
		[{species: (Human), build: (build GRCh38), from: [{type:vcf, relationship: proband},{type:bam, relationship: proband}]}]
*/
GenomeBuildHelper.prototype.getBuildsInHeaders = function(bamHeaderMap, vcfHeaderMap) {
	var me = this;
	var theBuilds = [];

	for (relationship in bamHeaderMap) {
		var header = bamHeaderMap[relationship];
		var buildInfo = me.getBuildFromBamHeader(header);
		me.parseBuildInfo(buildInfo, relationship, 'bam', theBuilds);
	}			
	for (relationship in vcfHeaderMap) {
		var header = vcfHeaderMap[relationship];
		var buildInfo = me.getBuildFromVcfHeader(header);
		me.parseBuildInfo(buildInfo, relationship, 'vcf', theBuilds);
	}			

	return theBuilds;
}


GenomeBuildHelper.prototype.getBuildFromBamHeader = function(header) {
	var me = this;
	var buildInfo = {species: null, build: null, references: {}};

	if (header) {
		var lines = header.split("\n");
		for ( var i=0; i<lines.length > 0; i++) {
			 var fields = lines[i].split("\t");
			 if (fields[0] == "@SQ") {
			    var fieldMap = {};
			    fields.forEach(function(field) {
			      var values = field.split(':');
			      fieldMap[ values[0] ] = values[1]
			    })
			    var refName   = fieldMap["SN"];
			    var refLength = 1+parseInt(fieldMap["LN"]);
			    var species   = fieldMap["SP"];
			    var assembly  = fieldMap["AS"]
			    if (refName && refLength) {
					buildInfo.references[refName] = refLength;
			    }
			    if (!buildInfo.species && species ) {
				    buildInfo.species = species;
			    }
			    if (!buildInfo.build && assembly) {
			    	buildInfo.build = assembly;
			    }
			 }
		}	
	}

	return buildInfo;
}

GenomeBuildHelper.prototype.getBuildFromVcfHeader = function(header) {
    var me = this;

	var buildInfo = {species: null, build: null, references: {}};
	if (header) {
		header.split("\n").forEach(function(headerRec) {
		  if (headerRec.indexOf("##contig=<") == 0) {
		    var allFields = headerRec.split("##contig=<")[1];

		    var fields = allFields.split(/[,>]/);
		    var refName = null;
		    var refLength = null;
		    fields.forEach(function(field) {
		      if (field.indexOf("ID=") == 0) {
		        refName = field.split("ID=")[1];
		      }
		      if (field.indexOf("length=") == 0) {
		        refLength = field.split("length=")[1];
		      }
		      if (!buildInfo.build && field.indexOf("assembly=") == 0) {
		        buildInfo.build = field.split("assembly=")[1];
		      }
		      if (!buildInfo.species && field.indexOf("species=") == 0) {
		        var speciesString = field.split("species=")[1];
		        if (speciesString.indexOf("\"") == 0) {
		          buildInfo.species = speciesString.split("\"")[1];
		        } else {
		          buildInfo.species = speciesString;
		        }
		      }
		    })
		    if (refName && refLength) {
		      buildInfo.references[refName] = refLength;
		    }
		  }
		});
	}
	return buildInfo;
}


GenomeBuildHelper.prototype.parseBuildInfo = function(buildInfo, relationship, type, theBuilds) {
	var me = this;

	if (buildInfo == null || (buildInfo.species == null && buildInfo.build == null && (buildInfo.references == null || Object.keys(buildInfo.references).length == 0))) {
		// We don't have any information in the file to find the species and build
	} else {
		// We have build info from the file.  Now try to match it to a known species and build
		var speciesBuild = me.getProperSpeciesAndBuild(buildInfo);
		if (speciesBuild.species && speciesBuild.build) {
			if (theBuilds.length == 0) {
				// TODO:  Need to indicate which data files (proband-bam, mother-bam, father-vcf, etc)
				// that have this build
				theBuilds.push( {species: speciesBuild.species, build: speciesBuild.build, from: [{type: type, relationship: relationship}]});
			} else {
				var foundAggregate = null;
				theBuilds.forEach(function(aggregateSpeciesBuild) {
					if (aggregateSpeciesBuild.species == speciesBuild.species && aggregateSpeciesBuild.build == speciesBuild.build) {
						foundAggregate = aggregateSpeciesBuild;
					}
				});
				if (foundAggregate) {
					from = foundAggregate.from;
					from.push({type: type, relationship: relationship});

				} else {
					theBuilds.push( {species: speciesBuild.species, build: speciesBuild.build, from: [{type: type, relationship: relationship}]});
				}

			}				
		}

	}

}


/*
	Given the species and build names in the file header, try to find the corresponding
	species and genome build based on matching the header names to the names (name, binomialName, latin_name)
	of the species and the names (name and aliases) of genome build. 
*/
GenomeBuildHelper.prototype.getProperSpeciesAndBuild = function(buildInfo) {
	var me = this;
	var matchedSpecies = null;
	var matchedBuild = null;

	if (buildInfo != null) {
		// If the bam header provided a species, make sure it matches the
		// selected species name (or latin or binomial name).
		if (buildInfo.species) {
			for (speciesName in me.speciesNameToSpecies) {
				if (!matchedSpecies) {
					var species = me.speciesNameToSpecies[speciesName];
					if (species.name == buildInfo.species || species.binomialName == buildInfo.species || species.latin_name ==  buildInfo.species ) {
						matchedSpecies = species;
					} 					
				}
			} 
		}

		// For now, just default to Human if species can't be determined from file headers
		if (!matchedSpecies) {
			matchedSpecies = me.speciesNameToSpecies[me.DEFAULT_SPECIES];
		}

		// Make sure each bam has a build that matches the selected
		// build name or one of its aliases
		if (matchedSpecies) {
			if (buildInfo.build) {
				matchedSpecies.genomeBuilds.forEach(function(build) {
					if (!matchedBuild) {
						if (build.name == buildInfo.build) {
							matchedBuild = build;
						} else {
							build.aliases.forEach(function(gbAlias) {
								if (gbAlias.alias == buildInfo.build) {
									matchedBuild = build;
								}
							})
						}																
					}
				})
							
			} else {
				// If a build wasn't specified, try to match to a genome build based on reference lengths
				matchedSpecies.genomeBuilds.forEach(function(build) {
					if (!matchedBuild) {
						var matchedCount = 0;
						var notMatchedCount = 0;
						var notFoundCount = 0;
						build.references.forEach(function(reference) {
							var refLength = null;
							if (buildInfo.references[reference.name]) {
								refLength = buildInfo.references[reference.name];
							} else if (buildInfo.references[reference.alias]) {
								refLength = buildInfo.references[reference.name];
							}
							if (refLength && refLength == reference.length) {
								matchedCount++;
							} else if (refLength && refLength == reference.length - 1) {
								matchedCount++;
							} else if (refLength && refLength == reference.length + 1) {
								matchedCount++;
							} else if (refLength && refLength != reference.length) {
								notMatchedCount++;
							} else {
								notFoundCount++;
							}
						});
						if (build.references.length == matchedCount) {
							matchedBuild = build;
						} else if (matchedCount > 0 && notMatchedCount == 0 && notFoundCount == 0) {
							matchedBuild = build;
						}

					}

				})

			}
		}
	}
	return {species: matchedSpecies, build: matchedBuild};


}

GenomeBuildHelper.prototype.formatIncompatibleBuildsMessage = function(buildsInData) {
	var message = "Imcompatible builds in files.";	
	buildsInData.forEach(function(buildInfo) {
		message += "<br>Build " + buildInfo.species.name + " " + buildInfo.build.name + " specified in ";
		var fromCount = 0;
		buildInfo.from.forEach(function(fileInfo) {
			if (fromCount > 0) {
				message += ", ";
			}
			message += fileInfo.relationship + " " + fileInfo.type;
			fromCount++;
		});
		message += ".";
	});
	return message;	
}


