# Free LLM Setup Guide

This guide will help you set up Sparky with free LLM providers so you can use the agent without any API costs.

## Option 1: Ollama (Recommended - 100% Free)

Ollama runs models locally on your machine - completely free and private!

### Step 1: Install Ollama

**macOS:**
```bash
brew install ollama
# or download from https://ollama.ai
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from https://ollama.ai

### Step 2: Pull a Model

```bash
# Recommended models (pick one):
ollama pull llama3.2          # Good balance of speed and quality
ollama pull mistral            # Fast and efficient
ollama pull codellama          # Great for code-related tasks
ollama pull llama3.1:8b        # Larger, more capable
```

### Step 3: Configure Sparky

Create or update your `.env` file:

```bash
LLM_PROVIDER=ollama
OLLAMA_MODEL=llama3.2
```

### Step 4: Test It!

```bash
npm start "What is 15 * 23?"
```

**That's it!** You're now running a completely free AI agent locally.

## Option 2: Groq (Free Tier)

Groq offers fast inference with a free tier.

### Step 1: Get API Key

1. Go to https://console.groq.com
2. Sign up for a free account
3. Create an API key

### Step 2: Configure Sparky

Add to your `.env` file:

```bash
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

### Step 3: Test It!

```bash
npm start "What is 15 * 23?"
```

## Option 3: Hugging Face (Free Tier)

Hugging Face provides access to many open-source models.

### Step 1: Get API Key

1. Go to https://huggingface.co/settings/tokens
2. Sign up for a free account
3. Create an access token

### Step 2: Configure Sparky

Add to your `.env` file:

```bash
LLM_PROVIDER=huggingface
HUGGINGFACE_API_KEY=your_hf_token_here
HUGGINGFACE_MODEL=meta-llama/Meta-Llama-3-8B-Instruct
```

### Step 3: Test It!

```bash
npm start "What is 15 * 23?"
```

## Comparison

| Provider | Cost | Speed | Privacy | Function Calling | Setup Difficulty |
|----------|------|-------|---------|------------------|------------------|
| **Ollama** | 🆓 Free | ⚡ Fast (local) | 🔒 Private | ✅ Good | 🟢 Easy |
| **Groq** | 🆓 Free tier | ⚡⚡ Very Fast | 🌐 Cloud | ✅ Excellent | 🟢 Easy |
| **Hugging Face** | 🆓 Free tier | ⚡ Moderate | 🌐 Cloud | ⚠️ Varies | 🟡 Medium |
| **OpenAI** | 💰 Paid | ⚡ Fast | 🌐 Cloud | ✅ Excellent | 🟢 Easy |

## Troubleshooting

### Ollama: "Cannot connect to Ollama"

**Solution:**
1. Make sure Ollama is running: `ollama serve`
2. Check if the model is installed: `ollama list`
3. If not, pull it: `ollama pull llama3.2`

### Groq: "Authentication failed"

**Solution:**
1. Verify your API key is correct
2. Check your Groq account has available quota
3. Make sure `GROQ_API_KEY` is set in `.env`

### Hugging Face: "Model not found"

**Solution:**
1. Check the model name is correct
2. Some models may require accepting terms - visit the model page on Hugging Face
3. Try a different model like `mistralai/Mistral-7B-Instruct-v0.2`

## Recommended Setup for Beginners

1. **Start with Ollama** - It's the easiest and completely free
2. Install Ollama and pull `llama3.2`
3. Set `LLM_PROVIDER=ollama` in `.env`
4. You're done! No API keys needed.

## Need Help?

- Check the main [README.md](README.md) for more details
- Review error messages in `logs/agent.log`
- Make sure your `.env` file has the correct provider set

Happy coding! 🚀

