import { Request, Response } from "express";
import axios from "axios";
import { config } from "dotenv";
config();

const axiosInstance = axios.create({
  baseURL: process.env.DEV === "true" ? "http://localhost:8080/" : "http://metadata.google.internal/",
  timeout: 1000,
  headers: { "Metadata-Flavor": "Google" },
});

export const metadataService = (req: Request, res: Response) => {
  let path = req.query.path || "computeMetadata/v1/instance/service-accounts/default/scopes";
  console.log("process.env.DEV", process.env.DEV);
  axiosInstance.get(path as string).then((response) => {
    res.send({ data: response.data });
  }).catch((error) => {
    if (process.env.DEV === "true") {
      res.send({ data: "local-scope" });
    } else {
      res.status(500).send({ error: error.message });
    }
  });
};

export const getServiceAccountEmail = async () => {
  if (process.env.DEV === "true") {
    return `${process.env.GCLOUD_PROJECT}@appspot.gserviceaccount.com`;
  }
  return (await axiosInstance.get("computeMetadata/v1/instance/service-accounts")).data.split("\n")[1];
};

export const getProjectId = async () => {
  if (process.env.DEV === "true") {
    return process.env.GCLOUD_PROJECT;
  }
  return (await axiosInstance.get("computeMetadata/v1/project/project-id")).data;
};

export const getNumericProjectId = async () => {
  if (process.env.DEV === "true") {
    return "123456789"; // Mock numeric project ID for local development
  }
  return (await axiosInstance.get("computeMetadata/v1/project/numeric-project-id")).data;
};

export const generateServiceAccessToken = async (audience) => {
  if (process.env.DEV === "true") {
    return "local-access-token"; // Mock access token for local development
  }
  return (await axiosInstance.get(`computeMetadata/v1/instance/service-accounts/default/identity?audience=${audience}`)).data;
};

//https://www.googleapis.com/oauth2/v1/certs
