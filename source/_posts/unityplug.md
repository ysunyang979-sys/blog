---
title: unity插件
date: 2024-05-21 18:00:00
tags: [guide, efficiency, markdown]
categories: 
    - unity
    - 效率/技巧
    - 插件
---
# unity 自建插件

>共7个插件，UI插件，轴心插件，镜像插件，阵列插件，脚本信息插件，快速浏览插件（小型project窗口，更加方便），插件管理器（插件）
<!-- more -->   
UI插件，按下按键归位锚点（AltShiftA, AltZ, AltA在tools中修改）
```csharp 
// 位置：Assets/Editor/UIAnchorTool_Pro.cs
using UnityEngine;
using UnityEditor;

namespace Tools.UI
{
    public enum AnchorKeyMode
    {
        AltShiftA, // 默认
        AltZ,
        AltA
    }

    public static class UIAnchorTool_Pro
    {
        private const string PREF_KEY = "UIAnchorTool_KeyMode";

        // 获取当前模式
        private static AnchorKeyMode CurrentMode
        {
            get { return (AnchorKeyMode)EditorPrefs.GetInt(PREF_KEY, (int)AnchorKeyMode.AltShiftA); }
            set { EditorPrefs.SetInt(PREF_KEY, (int)value); }
        }

        [MenuItem("Tools/UI/Anchor Settings/Use [Alt + Shift + A]", false, 1)]
        static void SetModeAltShiftA() { CurrentMode = AnchorKeyMode.AltShiftA; }
        
        [MenuItem("Tools/UI/Anchor Settings/Use [Alt + Shift + A]", true)]
        static bool ValidateModeAltShiftA() 
        { 
            Menu.SetChecked("Tools/UI/Anchor Settings/Use [Alt + Shift + A]", CurrentMode == AnchorKeyMode.AltShiftA);
            return true; 
        }

        // --- 选项 B: Alt + Z ---
        [MenuItem("Tools/UI/Anchor Settings/Use [Alt + Z]", false, 2)]
        static void SetModeAltZ() { CurrentMode = AnchorKeyMode.AltZ; }

        [MenuItem("Tools/UI/Anchor Settings/Use [Alt + Z]", true)]
        static bool ValidateModeAltZ() 
        { 
            Menu.SetChecked("Tools/UI/Anchor Settings/Use [Alt + Z]", CurrentMode == AnchorKeyMode.AltZ);
            return true; 
        }

        // --- 选项 C: Alt + A ---
        [MenuItem("Tools/UI/Anchor Settings/Use [Alt + A]", false, 3)]
        static void SetModeAltA() { CurrentMode = AnchorKeyMode.AltA; }

        [MenuItem("Tools/UI/Anchor Settings/Use [Alt + A]", true)]
        static bool ValidateModeAltA() 
        { 
            Menu.SetChecked("Tools/UI/Anchor Settings/Use [Alt + A]", CurrentMode == AnchorKeyMode.AltA);
            return true; 
        }

        [MenuItem("Tools/UI/Run Snap Anchors (Alt+Shift+A) &#a", false, 100)]
        static void TriggerAltShiftA()
        {
            if (CurrentMode != AnchorKeyMode.AltShiftA) return; 
            ExecuteSnap();
        }

        [MenuItem("Tools/UI/Run Snap Anchors (Alt+Z) &z", false, 101)]
        static void TriggerAltZ()
        {
            if (CurrentMode != AnchorKeyMode.AltZ) return;
            ExecuteSnap();
        }

        [MenuItem("Tools/UI/Run Snap Anchors (Alt+A) &a", false, 102)]
        static void TriggerAltA()
        {
            if (CurrentMode != AnchorKeyMode.AltA) return;
            ExecuteSnap();
        }
        
        static void ExecuteSnap()
        {
            if (Selection.transforms.Length == 0) return;

            foreach (var transform in Selection.transforms)
            {
                RectTransform t = transform as RectTransform;
                if (t == null) continue;

                RectTransform parent = t.parent as RectTransform;
                if (parent == null) continue;

                Undo.RecordObject(t, "Snap Anchors");
                SnapToCorners(t, parent);
            }
        }

        static void SnapToCorners(RectTransform target, RectTransform parent)
        {
            Vector2 parentSize = parent.rect.size;
            if (parentSize.x == 0 || parentSize.y == 0) return;

            Vector2 newAnchorMin = target.anchorMin + target.offsetMin / parentSize;
            Vector2 newAnchorMax = target.anchorMax + target.offsetMax / parentSize;

            target.anchorMin = newAnchorMin;
            target.anchorMax = newAnchorMax;
            target.offsetMin = Vector2.zero;
            target.offsetMax = Vector2.zero;
            
            EditorUtility.SetDirty(target);
        }
    }
}
```


轴心插件，改变物体的轴心
```csharp
using UnityEngine;
using UnityEditor;
using System.Collections.Generic;

namespace MyGameTools.Modeling 
{
    public class PivotModifierTool : EditorWindow
    {
        private static bool IsEditMode = false;
        private static Tool LastTool = Tool.None;

        [MenuItem("Tools/Modeling/Toggle Pivot Edit Mode %g")] 
        public static void TogglePivotMode()
        {
            IsEditMode = !IsEditMode;

            if (IsEditMode)
            {
                LastTool = UnityEditor.Tools.current;
                UnityEditor.Tools.current = Tool.None;
                
                SceneView.duringSceneGui += OnSceneGUI;
                Debug.Log($"<color=#44FFaa>【Pivot Tool】</color> 轴心编辑模式：<b>开启</b> (按 Ctrl+G 关闭)");
            }
            else
            {
                UnityEditor.Tools.current = LastTool;
                
                SceneView.duringSceneGui -= OnSceneGUI;
                Debug.Log($"<color=#FF4444>【Pivot Tool】</color> 轴心编辑模式：<b>关闭</b>");
            }
            
            SceneView.RepaintAll();
        }

        [MenuItem("Tools/Modeling/Toggle Pivot Edit Mode %g", true)]
        public static bool ValidateToggle()
        {
            Menu.SetChecked("Tools/Modeling/Toggle Pivot Edit Mode %g", IsEditMode);
            return Selection.activeTransform != null;
        }

        private static void OnSceneGUI(SceneView sceneView)
        {
            if (!IsEditMode) return;

            Transform target = Selection.activeTransform;
            if (target == null) return;

            Handles.BeginGUI();
            var rect = new Rect(10, Screen.height - 80, 200, 60);
            GUI.Box(rect, "Pivot Editing Mode");
            GUI.Label(new Rect(20, Screen.height - 60, 180, 20), "Target: " + target.name);
            GUI.Label(new Rect(20, Screen.height - 40, 180, 20), "Status: Drag Handle to Move Pivot");
            Handles.EndGUI();

            EditorGUI.BeginChangeCheck();
            
            Vector3 currentPivot = target.position;
            
            Quaternion rotation = (UnityEditor.Tools.pivotRotation == PivotRotation.Local) ? target.rotation : Quaternion.identity;

            Vector3 newPivot = Handles.PositionHandle(currentPivot, rotation);

            if (EditorGUI.EndChangeCheck())
            {
                Vector3 delta = newPivot - currentPivot;
                Undo.RecordObject(target, "Move Pivot");
                ApplyPivotMove(target, delta);
            }
        }

        private static void ApplyPivotMove(Transform target, Vector3 worldDelta)
        {
            var children = new List<Transform>();
            var childrenPositions = new List<Vector3>();
            
            foreach (Transform child in target)
            {
                children.Add(child);
                childrenPositions.Add(child.position);
                Undo.RecordObject(child, "Fix Children Position");
            }

            target.position += worldDelta;

            for (int i = 0; i < children.Count; i++)
            {
                children[i].position = childrenPositions[i];
            }

            MeshFilter mf = target.GetComponent<MeshFilter>();
            if (mf != null && mf.sharedMesh != null)
            {
                Undo.RecordObject(mf, "Modify Mesh Pivot");

                Mesh mesh = mf.mesh; 
                Vector3[] verts = mesh.vertices;
                
                Vector3 localDelta = target.InverseTransformVector(worldDelta);

                for (int i = 0; i < verts.Length; i++)
                {
                    verts[i] -= localDelta;
                }

                mesh.vertices = verts;
                mesh.RecalculateBounds();
            }

            var colliders = target.GetComponents<Collider>();
            foreach (var col in colliders)
            {
                Undo.RecordObject(col, "Modify Collider Pivot");
                
                Vector3 localDelta = target.InverseTransformVector(worldDelta);

                if (col is BoxCollider box) box.center -= localDelta;
                else if (col is SphereCollider sphere) sphere.center -= localDelta;
                else if (col is CapsuleCollider capsule) capsule.center -= localDelta;
                else if (col is MeshCollider meshCol)
                {
                    meshCol.sharedMesh = null;
                    meshCol.sharedMesh = mf.mesh;
                }
            }
        }
    }
}
```

<a href="https://wwbre.lanzn.com/ioikz3coss8j" class="btn">unity自建插件下载</a>

---

<a href="https://uplugin.vercel.app/" class="btn">unity优质付费插件（445个资源）</a>


<a href="https://pan.quark.cn/s/0f2e9b4e78f5" class="btn">unity完整项目</a>


























