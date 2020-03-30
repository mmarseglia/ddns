# ddns

---
Reimplementation of noip in node for self-hosting a noip service on AWS.
---

## Description

The Unifi Security Gateway (USG) has a Dynamic DNS (DDNS) feature, used to create or update a DNS record with the dynamic IP address assigned by an ISP to the USG.
The USG has a list of services to choose from but there is no self-hosted or custom option.  This allows you to host your own DDNS service in AWS using Route53.

It is intented that the application run on an AWS compute resource. AWS permissions to access Route53 are inherited from the compute resource. 

## Requirements

* docker
* AWS compute resource to the application
* AWS Route53 hosted domain

## How To

### Configure USG

* Create a random alphanumeric 32 character string to use as an *AUTH* token.
* Create a Dynamic DNS service
* Service: noip
* Hostname: *fully.qualified.domain.name*-*AUTH*
* Username: blank
* Password: blank
* Server: https endpoint where the app is running

### Build/Run

* Build the docker container
* Run the docker container on an AWS compute resource, pass *ZONE_ID* and *AUTH* as environment variables.
* Create an IAM role to create records in the Route53 zone, assign the role to whatever compute resource this app is running on.
* Run this on a compute resource that will expose the applications with a HTTPS endpoint, see *Example Deployment*.  Configure the USG with this HTTPS endpoint.

## How It Works (generally)

1. The USG passes the hostname to application as an HTTP query parameter.  The application parses the hostname query parameter for the *AUTH* token.
1. If the *AUTH* token of the running docker container matches what is sent in the HTTP request then the request is Authorized.
1. The application attempts to UPSERT (update/create) a DNS Resource Record in the zone specified by *ZONE_ID* with values from the hostname and myip query parameters.
1. If it successful it returns "good *IP ADDRESS*" in the body of the response to the USG, where *IP ADDRESS* is the WAN IP of the USG.

## Example Deployment

* Create an EC2 micro instance (free tier), install docker and run the docker image passing in the environment variables *ZONE_ID* and *AUTH*.
* Create an IAM Role allowing Route53 record create/update and assign the Role to the EC2 instance
* Create an TLS certificate using AWS ACM for the host *ddns.your.domain*.
* Create a AWS Application Load Balancer (ALB), assign the TLS certificate created by ACM and select the EC2 instance as the target.
* Create a Route53 ALIAS record for *ddns.your.domain* pointing to the ALB.
* Configure your security groups to allow HTTPS to the ALB and allow HTTP from the ALB to the EC2 instance.

# Reference

* https://www.ui.com/unifi-routing/usg/
* https://www.noip.com/integrate/response
* https://www.noip.com/integrate/request
