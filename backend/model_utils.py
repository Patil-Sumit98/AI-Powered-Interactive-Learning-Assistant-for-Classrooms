from transformers import AutoTokenizer, AutoModelForCausalLM
from openvino import Core
from openvino.tools.mo import convert_model
from openvino.runtime import serialize
import torch
import os

def download_and_convert(model_dir="../models/phi2_openvino_fp16"):
    model_name = "microsoft/phi-2"
    os.makedirs(model_dir, exist_ok=True)

    print("📦 Downloading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.save_pretrained(model_dir)

    print("🧠 Downloading PyTorch model...")
    model = AutoModelForCausalLM.from_pretrained(model_name, trust_remote_code=True, torch_dtype=torch.float32)
    model.eval()

    dummy_input = torch.ones(1, 512, dtype=torch.long)

    print("🔁 Exporting to ONNX...")
    onnx_path = os.path.join(model_dir, "model.onnx")

    class Wrapper(torch.nn.Module):
        def __init__(self, model):
            super().__init__()
            self.model = model

        def forward(self, input_ids):
            return self.model(input_ids=input_ids, use_cache=False).logits

    torch.onnx.export(
        Wrapper(model),
        dummy_input,
        onnx_path,
        input_names=["input_ids"],
        output_names=["logits"],
        dynamic_axes={"input_ids": {0: "batch", 1: "seq"}},
        opset_version=14
    )

    print("✅ Converting ONNX to OpenVINO IR (FP16)...")
    ov_model = convert_model(onnx_path, compress_to_fp16=True)
    serialize(ov_model, os.path.join(model_dir, "model.xml"))

    print(f"🎉 Model saved to: {model_dir}")
