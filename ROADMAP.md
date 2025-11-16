# 🛣️ Envilder Roadmap

Envilder aims to be the simplest, most reliable way to generate `.env` files from AWS SSM Parameter Store
— for both local development and CI/CD pipelines.

## ✅ Current Features

- Map-based secret resolution via `param-map.json`
- Outputs clean `.env` files
- Supports AWS profiles (`AWS_PROFILE`)
- Compatible with SecureString and plain parameters
- CLI-first, lightweight
- 📸 **Demo GIF/video** showing the tool in action (terminal + env + app)

---

## 🚧 Planned Improvements

### 🔹 Usability & Visibility

- [ ] 🔍 **Auto-discovery mode** (`--auto`) for fetching all parameters with a given prefix
- [ ] ✍️ **Tutorial repo** showing full example with GitHub Actions
- [x] 🛍️ **Official GitHub Action** (in Marketplace)

### 🔹 Dev Experience & Adoption

- [ ] ✅ **Check mode** (`--check`) to validate SSM vs existing `.env` and fail CI if out-of-sync
- [ ] 📝 **Onboarding doc** for new teams (how to set up param-map, profiles, best practices)

### 🔹 Advanced Features

- [ ] ↩️ **Push mode** (`--push`) to push local `.env` back to AWS SSM
- [ ] 🔔 **Optional webhook/Slack notifier** on secret sync (for audit/logging)
- [ ] 🌐 **Web-based interactive demo** (optional) to test mappings live
- [ ] 🧠 **Awesome list submissions** and community templates

---

## 🧪 Long-term Ideas (Open to Feedback)

- [ ] 📁 Support hierarchical `param-map.json` per environment
- [ ] 🧬 Plugin system for custom resolvers (e.g., secrets from other providers)

---

## 🙌 Contribute or suggest ideas

If you’ve faced similar problems or want to help improve this tool, feel free to open an issue, submit a PR
or reach out.  
Every bit of feedback helps make this tool better for the community.

---

## Feature Status

| Feature                        | Status         | Notes |
|--------------------------------|---------------|-------|
| Push mode (`--push`)           | ✅ Implemented | |
| Mapping-based secret resolution| ✅ Implemented | |
| .env file generation           | ✅ Implemented | |
| AWS profile support            | ✅ Implemented | |
| GitHub Action                  | ✅ Implemented | Available as composite action |
| Auto-discovery mode (`--auto`) | ❌ Not implemented | Planned |
| Check/sync mode (`--check`)    | ❌ Not implemented | Planned |
| Webhook/Slack notification     | ❌ Not implemented | Planned |
| Hierarchical mapping           | ❌ Not implemented | Only flat JSON mapping supported |
| Plugin system                  | ❌ Not implemented | Only AWS SSM supported |
