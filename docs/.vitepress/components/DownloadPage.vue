<template>
  <div class="download-page">
    <div v-if="loading" class="state-container">
      <div class="spinner"></div>
      <p>正在同步 GitHub 版本数据...</p>
    </div>

    <div v-else-if="error" class="state-container error">
      <p>无法连接至 GitHub API：{{ error }}</p>
      <a :href="githubReleasesUrl" target="_blank" rel="noreferrer" class="link-btn">
        前往 GitHub 下载页 →
      </a>
    </div>

    <template v-else-if="latestRelease">
      <!-- 版本概览 -->
      <header class="version-hero">
        <div class="version-badges">
          <a class="v-tag" :href="releaseTagUrl" target="_blank" rel="noreferrer">
            {{ latestRelease.tag_name }}
          </a>
          <span class="v-date">{{ formatDate(latestRelease.published_at) }}</span>
          <span v-if="latestRelease.prerelease" class="tag tag-warn">预发布</span>
        </div>
        <div class="mirror-selector">
          <label for="mirror-select">下载太慢？切换线路：</label>
          <select id="mirror-select" v-model="selectedMirror" class="mirror-select">
            <option v-for="mirror in mirrors" :key="mirror.id" :value="mirror.id">
              {{ mirror.name }}
            </option>
          </select>
        </div>
      </header>

      <!-- 推荐下载 -->
      <section class="recommend-card">
        <div class="card-header">
          <span class="magic-icon">✨</span>
          <div class="header-text">
            不确定选哪个？<span class="spacer"></span>
            <strong>无脑选 arm64-v8a</strong>
            <span class="spacer"></span>99% 的设备都是它
          </div>
        </div>

        <div v-if="recommended" class="action-list">
          <a :href="mirrorUrl(recommended.url)" class="action-btn">
            <div class="btn-main">
              <div class="btn-title-row">
                <span class="btn-title">下载 SPlayer for Android Next</span>
                <span class="tag tag-theme">{{ recommended.abi }}</span>
              </div>
              <span class="btn-desc">适用于绝大多数现代手机 / 平板</span>
            </div>
            <span class="size-badge">约 {{ formatSize(recommended.size) }}</span>
          </a>
        </div>

        <div v-if="latestRelease.body" class="changelog-section">
          <details>
            <summary>查看版本更新详情</summary>
            <div class="markdown-body" v-html="renderedChangelog"></div>
          </details>
        </div>
      </section>

      <!-- 全架构列表 -->
      <section id="abi-list" class="platforms-section">
        <div class="section-divider">
          <h2>分架构安装包</h2>
          <div class="arch-guide">
            <span class="guide-item">
              不清楚自己设备的架构？装个 <strong>CPU-Z</strong> 看一眼，或直接选
              <strong>arm64-v8a</strong>
            </span>
            <span class="guide-item">
              每个安装包都附带 <strong>.sha256</strong> 校验文件，下载后可核对完整性
            </span>
          </div>
        </div>

        <div class="files-grid">
          <div v-for="item in abiList" :key="item.abi" class="file-card">
            <div class="file-content">
              <div class="file-name-row">
                <span class="file-name">{{ item.abi }}</span>
                <span class="tag tag-theme">{{ item.stars }}</span>
              </div>
              <span class="file-desc">{{ item.desc }}</span>
            </div>
            <div class="file-actions">
              <span class="file-size">{{ item.asset ? formatSize(item.asset.size) : "—" }}</span>
              <a
                v-if="item.asset"
                :href="mirrorUrl(item.asset.url)"
                class="file-btn"
                :class="{ primary: item.abi === 'arm64-v8a' }"
              >
                下载 APK
              </a>
              <a
                v-if="item.checksum"
                :href="mirrorUrl(item.checksum.browser_download_url)"
                class="file-btn ghost"
                title="SHA256 校验文件"
              >
                SHA256
              </a>
              <span v-if="!item.asset" class="file-btn disabled">本版本未提供</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 安装提示 -->
      <section class="install-tip">
        <h2>安装提示</h2>
        <ol>
          <li>最低系统要求 <strong>Android 10（API 29）</strong>，更低版本无法安装。</li>
          <li>
            APK 未上架应用商店，安装时系统会提示「未知来源」，请在弹窗中选择
            <strong>允许本次安装</strong>。
          </li>
          <li>覆盖安装前请确认新旧版本签名一致，否则需先卸载旧版（设置可导出备份）。</li>
          <li>
            需要查找历史版本？<a :href="githubReleasesUrl" target="_blank" rel="noreferrer">
              访问 GitHub Release 归档
            </a>
          </li>
        </ol>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { marked } from "marked";

const GITHUB_REPO = "SPlayer-CE/SPlayer-for-Android-Next";
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=10`;
const githubReleasesUrl = `https://github.com/${GITHUB_REPO}/releases`;

interface GitHubAsset {
  name: string;
  browser_download_url: string;
  size: number;
}
interface GitHubRelease {
  tag_name: string;
  body: string;
  published_at: string;
  prerelease: boolean;
  draft: boolean;
  assets: GitHubAsset[];
}
interface AbiAsset {
  abi: string;
  url: string;
  size: number;
}

const ABI_META: { abi: string; desc: string; stars: string }[] = [
  { abi: "arm64-v8a", desc: "绝大多数现代手机 / 平板", stars: "⭐⭐⭐⭐⭐" },
  { abi: "armeabi-v7a", desc: "2015 年前的老旧 32 位 ARM 设备", stars: "⭐⭐" },
  { abi: "x86_64", desc: "Intel 平板、Android 模拟器", stars: "⭐" },
  { abi: "x86", desc: "极少数 32 位 Intel 设备", stars: "⭐" },
];

const mirrors = [
  { id: "official", name: "GitHub", url: "" },
  { id: "cloudflare", name: "Cloudflare", url: "https://gh-proxy.org/" },
  { id: "hk", name: "Sharon CDN", url: "https://hk.gh-proxy.org/" },
  { id: "fastly", name: "Fastly", url: "https://cdn.gh-proxy.org/" },
  { id: "edgeone", name: "EdgeOne", url: "https://edgeone.gh-proxy.org/" },
];

const selectedMirror = ref("official");
const loading = ref(true);
const error = ref<string | null>(null);
const latestRelease = ref<GitHubRelease | null>(null);

// 从文件名中识别 ABI，注意 x86_64 必须先于 x86 匹配
const parseAbi = (name: string): string | null => {
  const match = name.match(/(arm64-v8a|armeabi-v7a|x86_64|x86)\.apk$/i);
  return match ? match[1] : null;
};

const pickAssets = (release: GitHubRelease) => {
  const apks: Record<string, AbiAsset> = {};
  const checksums: Record<string, GitHubAsset> = {};
  for (const asset of release.assets) {
    const isChecksum = asset.name.endsWith(".sha256");
    const abi = parseAbi(isChecksum ? asset.name.slice(0, -".sha256".length) : asset.name);
    if (!abi) continue;
    if (isChecksum) checksums[abi] = asset;
    else apks[abi] = { abi, url: asset.browser_download_url, size: asset.size };
  }
  return { apks, checksums };
};

const picked = computed(() =>
  latestRelease.value ? pickAssets(latestRelease.value) : { apks: {}, checksums: {} },
);

const abiList = computed(() =>
  ABI_META.map((meta) => ({
    ...meta,
    asset: picked.value.apks[meta.abi] ?? null,
    checksum: picked.value.checksums[meta.abi] ?? null,
  })),
);

const recommended = computed(() => picked.value.apks["arm64-v8a"] ?? abiList.value[0]?.asset);

const releaseTagUrl = computed(
  () => `${githubReleasesUrl}/tag/${latestRelease.value?.tag_name ?? ""}`,
);

const renderedChangelog = computed(() => marked.parse(latestRelease.value?.body ?? ""));

const mirrorUrl = (original: string): string => {
  if (selectedMirror.value === "official" || !original) return original;
  const mirror = mirrors.find((m) => m.id === selectedMirror.value);
  return mirror?.url ? mirror.url + original : original;
};

const formatSize = (bytes: number) =>
  bytes ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : "未知";
const formatDate = (s: string) =>
  new Date(s).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });

const fetchRelease = async () => {
  try {
    const res = await fetch(GITHUB_API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const list = (await res.json()) as GitHubRelease[];
    const release = list.find((r) => !r.draft);
    if (!release) throw new Error("暂无可用版本");
    latestRelease.value = release;
  } catch (e) {
    error.value = (e as Error).message || "请求失败";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchRelease);
</script>

<style scoped>
.download-page {
  --card-bg: var(--vp-c-bg-soft);
  --card-border: var(--vp-c-divider);
  --primary: var(--vp-c-brand-1);
  --primary-bg: var(--vp-c-brand-soft);
  --text-main: var(--vp-c-text-1);
  --text-sub: var(--vp-c-text-2);
  --text-mute: var(--vp-c-text-3);

  margin: 30px auto 0;
  color: var(--text-main);
}

.state-container {
  padding: 80px 0;
  text-align: center;
}

.state-container.error {
  color: var(--vp-c-danger-1);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--card-border);
  border-top-color: var(--primary);
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 0.8s linear infinite;
}

.link-btn {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.link-btn:hover {
  text-decoration: underline;
}

/* 版本概览 */
.version-hero {
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.version-badges {
  display: flex;
  align-items: center;
  gap: 12px;
}

.v-tag {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary);
  background: var(--primary-bg);
  padding: 4px 16px;
  border-radius: 99px;
  text-decoration: none;
}

.v-date {
  color: var(--text-sub);
  font-size: 0.95rem;
}

.mirror-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--text-sub);
}

.mirror-select {
  padding: 6px 12px;
  border: 1px solid var(--card-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--text-main);
  font-size: 0.9rem;
  cursor: pointer;
}

.mirror-select:hover {
  border-color: var(--primary);
}

/* 推荐卡片 */
.recommend-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 4rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1.5rem;
  font-size: 1.05rem;
}

.header-text strong {
  color: var(--primary);
}

.spacer {
  width: 6px;
  display: inline-block;
}

.action-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--vp-c-bg);
  border: 1.5px solid var(--primary);
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.25s ease;
}

.action-btn:hover {
  background: var(--primary-bg);
  transform: translateY(-2px);
}

.btn-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.btn-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-title {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--primary);
}

.btn-desc {
  font-size: 0.85rem;
  color: var(--text-sub);
}

.size-badge {
  font-size: 0.8rem;
  background: var(--vp-c-bg-soft);
  padding: 4px 8px;
  border-radius: 6px;
  color: var(--text-sub);
  white-space: nowrap;
}

.changelog-section summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--text-sub);
  margin-top: 1rem;
}

.changelog-section summary:hover {
  color: var(--primary);
}

.markdown-body {
  font-size: 0.9rem;
  line-height: 1.6;
  padding: 10px;
}

/* 架构列表 */
.section-divider {
  margin-bottom: 2rem;
  text-align: center;
}

.section-divider h2 {
  border-top: none;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
  padding-top: 0;
}

.arch-guide {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
  color: var(--text-sub);
}

.arch-guide strong {
  color: var(--primary);
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.file-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--card-bg);
  border: 1px solid transparent;
  border-radius: 8px;
  transition: all 0.2s;
}

.file-card:hover {
  border-color: var(--primary);
}

.file-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.file-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-name {
  font-weight: 600;
  font-size: 1rem;
  font-family: var(--vp-font-family-mono);
}

.file-desc {
  font-size: 0.85rem;
  color: var(--text-sub);
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-size {
  font-size: 0.75rem;
  color: var(--text-mute);
  font-weight: 500;
  margin-right: auto;
}

.file-btn {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 6px;
  text-decoration: none;
  color: var(--primary);
  border: 1px solid var(--primary);
}

.file-btn.primary {
  background: var(--primary);
  color: var(--vp-c-bg);
}

.file-btn.ghost {
  color: var(--text-sub);
  border-color: var(--card-border);
}

.file-btn.disabled {
  color: var(--text-mute);
  border-color: var(--card-border);
  cursor: not-allowed;
}

/* 安装提示 */
.install-tip {
  margin-top: 4rem;
  padding: 1.5rem 2rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
}

.install-tip h2 {
  border-top: none;
  padding-top: 0;
  font-size: 1.3rem;
}

.install-tip ol {
  margin: 0;
  padding-left: 1.25rem;
  line-height: 1.9;
  color: var(--text-sub);
}

.install-tip strong {
  color: var(--text-main);
}

/* Tag */
.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.4;
}

.tag-theme {
  background: var(--primary-bg);
  color: var(--primary);
}

.tag-warn {
  background: var(--vp-c-warning-soft);
  color: var(--vp-c-warning-1);
}

@media (max-width: 640px) {
  .version-hero {
    flex-direction: column;
    align-items: stretch;
  }

  .recommend-card {
    padding: 1.25rem;
  }

  .action-btn {
    flex-direction: column;
    align-items: flex-start;
  }

  .files-grid {
    grid-template-columns: 1fr;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
