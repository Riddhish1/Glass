import TargetType from "./helper.TargetType.js";

//Comprehensive target analysis profile for intelligent decision making

class TargetProfile{
    constructor({
        target,
        target_type = TargetType.UNKNOWN,
        ip_addresses = [],
        open_ports = [],
        services = {},
        technologies= [],
        cms_type = null,
        cloud_provider = null,
        security_headers = {},
        ssl_info = {},
        subdomains = [],
        endpoints = [],
        attack_surface_score = 0.0,
        risk_level = "unknown",
        confidence_score = 0.0 
    }={}){
        this.target = target;
        this.target_type = target_type;
        this.ip_addresses = ip_addresses;
        this.open_ports = open_ports;
        this.services = services;
        this.technologies = technologies;
        this.cms_type = cms_type;
        this.cloud_provider = cloud_provider;
        this.security_headers = security_headers;
        this.ssl_info = ssl_info;
        this.subdomains = subdomains;
        this.endpoints = endpoints;
        this.attack_surface_score = attack_surface_score;
        this.risk_level = risk_level;
        this.confidence_score = confidence_score;
    }

    toJSON(){
        return{
            target: this.target,
            target_type: this.target_type,
            ip_addresses: this.ip_addresses,
            open_ports:this.open_ports,
            services:this.services,
            technologies: this.technologies.map(t => t?.value || t),
            cms_type: this.cms_type,
            cloud_provider: this.cloud_provider,
            security_headers: this.security_headers,
            ssl_info: this.ssl_info,
            subdomains: this.subdomains,
            endpoints: this.endpoints,
            attack_surface_score: this.attack_surface_score,
            risk_level: this.risk_level,
            confidence_score: this.confidence_score
        }
    }
}

export default TargetProfile;
