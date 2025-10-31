# Change Log

All notable changes to the "git-liner" extension will be documented in this file.

## [1.0.0] - 2024-10-31

### Added
- 🎉 Initial release of Git Liner
- 🔍 **Line History Tracking**: View precise Git history for the current line with `git log -L`
- 📁 **File History Viewing**: Complete Git commit history for files
- 🎯 **Smart Diff Display**: 
  - Line-level diffs for line history items
  - File-level diffs for file history items
  - Automatic fallback mechanisms
- 🚀 **Intuitive Interface**:
  - Right-click context menu integration
  - Dedicated sidebar views for line and file history
  - Different icons for line vs file commits
- ⚡ **Performance Optimized**:
  - Smart caching system (30-second cache)
  - Intelligent refresh logic
  - Minimal Git command usage
- 🎨 **Minimalist Design**:
  - No status bar clutter
  - Clean, focused UI
  - Perfect companion to Git Graph extension

### Features
- **Keyboard Shortcuts**:
  - `Ctrl+Alt+L` (Mac: `Cmd+Alt+L`) - Show line history
  - `Ctrl+Alt+H` (Mac: `Cmd+Alt+H`) - Show file history
- **Context Menus**: Right-click integration in editor
- **Smart History Tracking**: Handles line number changes across commits
- **Diff Viewing**: Click any commit to see detailed changes
- **Copy Commit Hash**: Easy access to commit hashes
- **Auto-refresh**: Smart refresh based on current editor context

### Technical Details
- Uses `git log -L` for accurate line history tracking
- Fallback to `git blame` when line tracking unavailable
- Temporary file management for diff viewing
- Comprehensive error handling and user feedback
- TypeScript implementation with full type safety

### Requirements
- VSCode 1.75.0 or higher
- Git installed and available in PATH
- Workspace must be a Git repository

---

## Planned Features for Future Releases

### [1.1.0] - Planned
- 🌐 Multi-language support (Chinese, English, etc.)
- 📊 Enhanced diff visualization
- 🔄 Git branch switching integration
- 📱 Better mobile/remote development support

### [1.2.0] - Planned  
- 🎨 Customizable themes and colors
- 📈 Performance metrics and analytics
- 🔧 Advanced Git configuration options
- 🚀 Integration with more Git tools

---

## Support

If you encounter any issues or have feature requests:
- 🐛 [Report Issues](https://github.com/crazykun/git-history-viewer/issues)
- 💡 [Feature Requests](https://github.com/crazykun/git-history-viewer/issues)
- 📖 [Documentation](https://github.com/crazykun/git-history-viewer#readme)

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/crazykun/git-history-viewer/blob/main/CONTRIBUTING.md) for details.