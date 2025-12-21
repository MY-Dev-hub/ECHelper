# scripts/convert_excel_to_json.py

import pandas as pd
import json
import os
from collections import defaultdict

print("="*50)
print("ECHelper - Excel to JSON Converter v3")
print("="*50)

excel_file = '../data/stat_v2_AddNew.xlsx'
output_dir = '../frontend/public/data'

os.makedirs(output_dir, exist_ok=True)

try:
    print("\n1. Excel 파일 읽는 중...")
    
    # Sheet 1: Export History
    print("   - Sheet 1 (Export History) 읽는 중...")
    df_export = pd.read_excel(excel_file, sheet_name=0)
    df_export.columns = df_export.columns.str.strip()
    df_export = df_export.where(pd.notna(df_export), None)
    
    export_json_path = os.path.join(output_dir, 'export_history.json')
    df_export.to_json(export_json_path, orient='records', force_ascii=False, indent=2)
    print(f"   ✓ 저장 완료: {export_json_path} ({len(df_export)}건)")
    
    # Sheet 3: Control List
    print("   - Sheet 3 (Control List) 읽는 중...")
    df_control = pd.read_excel(excel_file, sheet_name=2)
    df_control.columns = df_control.columns.str.strip()
    df_control = df_control.where(pd.notna(df_control), None)
    
    # 계층 구조 분석
    print("   - 계층 구조 분석 중...")
    
    control_list = []
    
    for idx, row in df_control.iterrows():
        eccn = str(row['ECCN']).strip()
        
        # 레벨 계산
        level = eccn.count('.')
        parts = eccn.split('.')
        
        # 카테고리 분류
        if len(eccn) >= 2:
            main_cat = eccn[0]
            sub_cat = eccn[:2]
        else:
            main_cat = eccn[0]
            sub_cat = eccn
        
        item = {
            'id': idx + 1,
            'eccn': eccn,
            'level': level,
            'mainCategory': main_cat,
            'subCategory': sub_cat,
            'parent': '.'.join(parts[:-1]) if level > 0 else None,
            'eccnDescription1': row.get('ECCN_description1'),
            'keywordKor': row.get('keyword_kor'),
            'keywordEng': row.get('keyword_eng'),
            'refClNo': row.get('REF_CLNo'),
            'refNo': row.get('REF_No'),
            'title': row.get('Title'),
            'description': row.get('Description'),
            'note': row.get('Note'),
            'techInfo': row.get('Tech_info'),
        }
        
        control_list.append(item)
    
    # Control List JSON 저장
    control_json_path = os.path.join(output_dir, 'control_list.json')
    with open(control_json_path, 'w', encoding='utf-8') as f:
        json.dump(control_list, f, ensure_ascii=False, indent=2)
    print(f"   ✓ 저장 완료: {control_json_path} ({len(control_list)}건)")
    
    # Sheet 2: Location
    print("   - Sheet 2 (Location) 읽는 중...")
    df_location = pd.read_excel(excel_file, sheet_name=1)
    df_location.columns = df_location.columns.str.strip()
    df_location = df_location.where(pd.notna(df_location), None)
    
    location_json_path = os.path.join(output_dir, 'location.json')
    df_location.to_json(location_json_path, orient='records', force_ascii=False, indent=2)
    print(f"   ✓ 저장 완료: {location_json_path} ({len(df_location)}건)")
    
    # Sheet 5: Participants (수출통제 체제 가입 정보)
    print("   - Sheet 5 (Participants) 읽는 중...")
    df_participants = pd.read_excel(excel_file, sheet_name=4)

    # 데이터 구조 변환
    participants = []
    participants_dict = {}  # 국가별로 중복 방지

    for idx, row in df_participants.iterrows():
        # 각 컬럼에서 국가명 추출
        nsg_country = row.get('NSG') if pd.notna(row.get('NSG')) else None
        ag_country = row.get('AG') if pd.notna(row.get('AG')) else None
        mtcr_country = row.get('MTCR') if pd.notna(row.get('MTCR')) else None
        wa_country = row.get('WA') if pd.notna(row.get('WA')) else None
        ca_country = row.get('CA') if pd.notna(row.get('CA')) else None
        
        # NSG/AG/MTCR/WA 중 하나라도 있으면 해당 국가 처리
        main_countries = [c for c in [nsg_country, ag_country, mtcr_country, wa_country] if c]
        
        if main_countries:
            country_name = main_countries[0]
            
            if country_name not in participants_dict:
                participants_dict[country_name] = {
                    'country': country_name,
                    'NSG': False,
                    'AG': False,
                    'MTCR': False,
                    'WA': False,
                    'CA': False
                }
            
            # 가입 정보 업데이트
            if nsg_country == country_name:
                participants_dict[country_name]['NSG'] = True
            if ag_country == country_name:
                participants_dict[country_name]['AG'] = True
            if mtcr_country == country_name:
                participants_dict[country_name]['MTCR'] = True
            if wa_country == country_name:
                participants_dict[country_name]['WA'] = True
            if ca_country == country_name:
                participants_dict[country_name]['CA'] = True
        
        # CA만 있는 국가 처리
        if ca_country and ca_country not in participants_dict:
            participants_dict[ca_country] = {
                'country': ca_country,
                'NSG': False,
                'AG': False,
                'MTCR': False,
                'WA': False,
                'CA': True
            }

    participants = list(participants_dict.values())

    participants_json_path = os.path.join(output_dir, 'participants.json')
    with open(participants_json_path, 'w', encoding='utf-8') as f:
        json.dump(participants, f, ensure_ascii=False, indent=2)
    print(f"   ✓ 저장 완료: {participants_json_path} ({len(participants)}건)")
    
    # 통계 정보
    stats = {
        "lastUpdated": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S"),
        "exportHistoryCount": len(df_export),
        "controlListCount": len(df_control),
        "locationCount": len(df_location),
        "participantsCount": len(participants),
        "categories": {
            "main": len(set(item['mainCategory'] for item in control_list)),
            "sub": len(set(item['subCategory'] for item in control_list))
        },
        "levels": {
            "level0": len([x for x in control_list if x['level'] == 0]),
            "level1": len([x for x in control_list if x['level'] == 1]),
            "level2": len([x for x in control_list if x['level'] == 2])
        }
    }
    
    stats_json_path = os.path.join(output_dir, 'stats.json')
    with open(stats_json_path, 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    print(f"   ✓ 통계 저장 완료: {stats_json_path}")
    
    print("\n" + "="*50)
    print("✅ 변환 완료!")
    print(f"   - Export History: {len(df_export)}건")
    print(f"   - Control List: {len(df_control)}건")
    print(f"   - Location: {len(df_location)}건")
    print(f"   - Participants: {len(participants)}건")
    print("="*50)
    
except Exception as e:
    print(f"\n❌ 오류 발생: {str(e)}")
    import traceback
    traceback.print_exc()

input("\n계속하려면 Enter를 누르세요...")