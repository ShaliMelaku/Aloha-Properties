import re

def fix_catches():
    path = 'src/app/admin/page.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find blocks like } catch { ... err ... } or } catch { ... e ... }
    # and replace catch { with catch (err: any) { or catch (e: any) {
    
    # Surgical fix for the specific upload block from line 1162
    content = content.replace(
        '} catch {\n                                              notify(\'error\', \'Upload failed: \' + (err',
        '} catch (err: any) {\n                                              notify(\'error\', \'Upload failed: \' + (err'
    )
    
    # Generic fix for catch blocks missing variables but using 'e' or 'err'
    content = re.sub(r'\} catch \{([^{}]*?\berr\b)', r'} catch (err: any) {\1', content)
    content = re.sub(r'\} catch \{([^{}]*?\be\b)', r'} catch (e: any) {\1', content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Final catch blocks repaired.")

if __name__ == "__main__":
    fix_catches()
