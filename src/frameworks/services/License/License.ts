import { Database } from "app/frameworks/database/Database";
import axios from "axios";
import * as MemoryCache from "memory-cache";
import * as moment from "moment";
import { Service } from "typedi";

@Service()
export class License {
  private _cache: MemoryCache.CacheClass<string, string>;
  private id = "";

  public async dairyGetLicense(id: string = "") {
    if (!this._cache) {
      this._cache = new MemoryCache.Cache();
    }
    let license = JSON.parse(this._cache.get("license"));
    if (((id === "") !== (this.id === "")) || !license) {
      try {
        const lastUpdate = await this.findLastUpdate();
        this._cache.put("lastUpdate", lastUpdate + "");
        const resp = await axios.get(process.env.ENDPOINT__LICENSE);
        license = resp.data;
        console.log("Get License");
        if (license && license.syncTime && license.lifeTime) {
          const now = moment().unix();
          if (lastUpdate <= now && now >= license.syncTime) {
            this._cache.put("license", JSON.stringify(license));
          }
        }
      } catch (error) {
        console.log("Error License");
      }
      setTimeout(() => this.dairyGetLicense(), 300000);
      this.id = id ? id : this.id;
    }
  }

  public async validLicense() {
    const lastUpdate = parseInt(this._cache.get("lastUpdate"));
    const license = JSON.parse(this._cache.get("license"));
    if (license) {
      const now = moment().unix();
      return lastUpdate <= now && now >= license.syncTime && now < license.lifeTime;
    } else {
      console.log("no license");
      return false;
    }

  }

  public async findLastUpdate() {
    const tables = await Database.instance.knex
      .raw("show tables;")
      .then(res => res[0].map((row: { [x: string]: string; }) => row[Object.keys(row)[0]]))
      .catch(e => e);
    const updateTime = await Promise.all(tables.map(async (table: string) => {
      const updated = await Database.instance.knex
      .select("updated_at").table(table).orderBy("updated_at", "desc").limit(1)
      .then(res => res[0] ? moment(res[0].updated_at).unix() : 0)
      .catch(e => 0);
      return updated;
    }) as number[]);
    return updateTime.reduce((a, b) => Math.max(a, b));
  }
}