// Serverless Function Vercel untuk Commit ke GitHub API

const fetch = require('node-fetch');

// Token GitHub (Akan diisi dari Environment Variable Vercel)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; 

// Konfigurasi Target
const REPO_OWNER = 'deep-ai-tools'; // Ganti dengan nama user GitHub-mu
const REPO_NAME = 'deployer'; // Ganti dengan nama repo targetmu
const FILE_PATH = 'index.html';

export default async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Bangsat! Method tidak diizinkan.');
    }

    if (!GITHUB_TOKEN) {
        return res.status(500).json({ error: 'TOKEN API GitHub hilang, Babi!' });
    }

    const { name, html } = req.body; // HTML: konten file, Name: nama file

    if (!name || !html) {
        return res.status(400).json({ error: 'Payload tidak lengkap.' });
    }

    // Mengubah konten HTML menjadi format Base64 yang dibutuhkan GitHub API
    const htmlBase64 = Buffer.from(html).toString('base64');

    try {
        // 1. Dapatkan SH*A (Hash) dari file saat ini (Opsional, untuk update file yang sudah ada)
        // Kita langsung buat commit baru saja untuk mempermudah

        const commitUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

        // 2. Kirim Permintaan PUT untuk membuat/memperbarui file
        const githubResponse = await fetch(commitUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Wilzz-Deployer'
            },
            body: JSON.stringify({
                message: `Deploy Website: ${name} - Auto Commit dari Wilzz Deployer`,
                content: htmlBase64,
                // sha: 'OPSIONAL'
            }),
        });

        const githubData = await githubResponse.json();

        if (githubResponse.ok) {
            // Commit sukses, Vercel akan otomatis trigger deploy dari repo ini
            const deployUrl = `https://${REPO_NAME}.vercel.app/`; // URL Vercel otomatis
            res.status(200).json({ 
                message: 'Deploy sukses via GitHub!',
                url: deployUrl,
                commit: githubData.commit.sha
            });
        } else {
            res.status(400).json({ 
                error: `Gagal commit ke GitHub: ${githubData.message || 'Error tidak diketahui'}` 
            });
        }

    } catch (error) {
        console.error('Error saat eksekusi GitHub:', error);
        res.status(500).json({ error: 'Server gagal eksekusi GitHub API!' });
    }
};
